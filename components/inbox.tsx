"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Copy, RefreshCw, RotateCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmailList } from "@/components/email-list"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  loadDomains, 
  createEmailAccount, 
  saveEmailData, 
  loadEmailData, 
  clearEmailData,
  generateHumanLikeEmailAccount,
  generateStrongPassword,
  getSiteKey,
  fetchEmails,
  type Domain,
  type EmailAccount,
  type EmailMessage,
  type EmailPagination,
  deleteEmailAccount
} from "@/lib/email-service"
import { EmailNotificationClient } from "@/lib/email-notification-client"
import GoogleAdsense from "@/plugin/adsense/google-adsense"
import { useTranslations } from 'next-intl'

interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  timestamp: string
  read: boolean
}

export function Inbox() {
  const t = useTranslations()
  const [emailAddress, setEmailAddress] = useState("")
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshingForNewEmails, setRefreshingForNewEmails] = useState(false)
  const [customEmailOpen, setCustomEmailOpen] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [currentAccount, setCurrentAccount] = useState<EmailAccount | null>(null)
  const [rawMessagesById, setRawMessagesById] = useState<Record<string, EmailMessage>>({})
  const [pagination, setPagination] = useState<EmailPagination>({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10
  })
  const [currentPage, setCurrentPage] = useState(1)
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false)
  const [wsEnabled, setWsEnabled] = useState(false)
  const [newEmailCount, setNewEmailCount] = useState(0)
  const notificationClientRef = useRef<EmailNotificationClient | null>(null)
  
  // Refs to store current state for WebSocket callbacks
  const currentAccountRef = useRef<EmailAccount | null>(null)
  const currentPageRef = useRef<number>(1)
  
  // Update refs when state changes
  useEffect(() => {
    currentAccountRef.current = currentAccount
  }, [currentAccount])
  
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  // Initialize the component on first load
  useEffect(() => {
    initializeInbox()
  }, [])

  // Load emails when account changes or page changes
  useEffect(() => {
    if (currentAccount) {
      loadEmails(currentPage)
    }
  }, [currentAccount, currentPage])

  const initializeWebSocket = (wsUrl: string) => {
    try {
      console.log('Initializing WebSocket with URL:', wsUrl)
      notificationClientRef.current = new EmailNotificationClient(wsUrl)
      
      // Set up notification handler
      console.log('Setting up notification handler...')
      notificationClientRef.current.onNewEmail((notification) => {
        console.log('WebSocket notification callback triggered:', notification)
        handleNewEmailNotification(notification)
      })
      
      // Authenticate and join email room when account is available
      if (currentAccount) {
        notificationClientRef.current.authenticate(currentAccount.id)
        notificationClientRef.current.joinEmailRoom(currentAccount.email)
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  const handleNewEmailNotification = (notification: any) => {
    console.log('New email notification received:', notification)
    console.log('Current page (ref):', currentPageRef.current, 'Current account (ref):', currentAccountRef.current?.email)
    
    // Increment new email count
    setNewEmailCount(prev => prev + 1)
    
    // Show toast notification
    toast({
      title: t('inbox.toastNewEmailTitle'),
      description: t('inbox.toastNewEmailDesc', {
        subject: notification.subject || t('inbox.contentNone'),
        from: notification.from || t('inbox.unknownSender')
      }),
    })
    
    // Refresh inbox to show new email (only if we're on the first page)
    if (currentAccountRef.current) {
      // If we're on the first page, refresh to show the new email at the top
      if (currentPageRef.current === 1) {
        console.log('Refreshing inbox to show new email')
        setRefreshingForNewEmails(true)
        
        // Use async/await to properly handle the Promise
        const refreshInbox = async () => {
          try {
            // Small delay to ensure notification is processed
            await new Promise(resolve => setTimeout(resolve, 200))
            console.log('Starting email refresh for notification...')
            await refreshEmailsForNotification(1)
            console.log('Inbox refreshed successfully after new email')
            
            // Fallback: if no emails were loaded, try again after a longer delay
            setTimeout(async () => {
              if (emails.length === 0 && currentAccountRef.current) {
                console.log('Fallback: No emails loaded, trying again...')
                await refreshEmailsForNotification(1)
              }
            }, 1000)
          } catch (error) {
            console.error('Error refreshing inbox:', error)
          } finally {
            setRefreshingForNewEmails(false)
            setNewEmailCount(0)
          }
        }
        
        refreshInbox()
      } else {
        // If we're on another page, show a notification that new emails are available
        console.log('On page', currentPageRef.current, '- showing notification for new emails')
        toast({
          title: t('inbox.toastNewEmailsAvailableTitle'),
          description: t('inbox.toastNewEmailsAvailableDesc'),
        })
      }
    } else {
      console.log('No current account available for refresh')
    }
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    if (wsUrl && wsUrl !== 'undefined' && wsUrl !== 'null') {
      initializeWebSocket(wsUrl)
    }

    return () => {
      // Cleanup WebSocket connection on unmount
      if (notificationClientRef.current) {
        notificationClientRef.current.disconnect()
      }
    }
  }, [])

  // Monitor WebSocket connection status
  useEffect(() => {
    const interval = setInterval(() => {
      if (notificationClientRef.current) {
        const status = notificationClientRef.current.getConnectionStatus()
        setWsConnected(status.isConnected)
        setWsEnabled(status.isEnabled)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Handle WebSocket authentication when account changes
  useEffect(() => {
    if (notificationClientRef.current && currentAccount) {
      // Wait for WebSocket to be ready
      const checkAndAuthenticate = () => {
        if (notificationClientRef.current?.isReady()) {
          console.log('WebSocket ready, authenticating with account:', currentAccount.id)
          notificationClientRef.current.authenticate(currentAccount.id)
          
          // Wait for authentication before joining room
          setTimeout(() => {
            if (notificationClientRef.current?.isReady()) {
              console.log('Joining email room:', currentAccount.email)
              notificationClientRef.current.joinEmailRoom(currentAccount.email)
            }
          }, 1000)
        } else {
          // Retry after a short delay
          setTimeout(checkAndAuthenticate, 500)
        }
      }
      
      // Start the authentication process
      checkAndAuthenticate()
    }
  }, [currentAccount])

  const initializeInbox = async () => {
    try {
      setLoading(true)
      
      // Load domains from API
      const availableDomains = await loadDomains()
      setDomains(availableDomains)
      
      // Check if we have a saved email account for this site
      const savedData = loadEmailData()
      
      if (savedData && savedData.currentAccount) {
        // Use existing account
        setCurrentAccount(savedData.currentAccount)
        setEmailAddress(savedData.currentAccount.email)
        setDomains(savedData.domains)
        
        // WebSocket authentication will be handled by useEffect when currentAccount changes
      } else {
        // Create a new random email account
        await createRandomEmailAccount(availableDomains)
      }
    } catch (error) {
      console.error('Error initializing inbox:', error)
      toast({
        title: t('inbox.toastErrorTitle'),
        description: t('inbox.initError'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEmails = async (page: number = 1) => {
    if (!currentAccount) return

    try {
      setLoading(true)
      console.log('Loading emails for page:', page, 'account:', currentAccount.id)
      const emailData = await fetchEmails(currentAccount.id, page)
      
      if (emailData) {
        console.log('Email data received:', emailData.messages.length, 'emails')
        // Convert API email format to component format
        const convertedEmails: Email[] = emailData.messages.map(msg => {
          // Format sender name with personal name if available
          let senderName = msg.from
          if (msg.mail_headers?.from?.[0]?.personal) {
            senderName = `${msg.mail_headers.from[0].personal} <${msg.from}>`
          }
          
          return {
            id: msg.id,
            sender: senderName,
            subject: msg.subject,
            preview: msg.text || msg.html || t('inbox.contentNone'),
            timestamp: formatDate(msg.date),
            read: msg.read
          }
        })
        
        setEmails(convertedEmails)
        setPagination(emailData.pagination)
        setCurrentPage(page)
        // Build raw message map for modal display
        const map: Record<string, EmailMessage> = {}
        for (const msg of emailData.messages) {
          map[msg.id] = msg
        }
        setRawMessagesById(map)
        console.log('Emails updated successfully')
      } else {
        console.log('No email data received, setting empty list')
        // Fallback to empty list if API fails
        setEmails([])
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          items_per_page: 10
        })
      }
    } catch (error) {
      console.error('Error loading emails:', error)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  // Separate function for refreshing emails when notifications arrive
  const refreshEmailsForNotification = async (page: number = 1) => {
    if (!currentAccountRef.current) {
      console.log('No current account available for notification refresh')
      return
    }

    try {
      console.log('Refreshing emails for notification, page:', page, 'account:', currentAccountRef.current.id)
      const emailData = await fetchEmails(currentAccountRef.current.id, page)
      
      if (emailData) {
        console.log('Notification refresh - Email data received:', emailData.messages.length, 'emails')
        // Convert API email format to component format
        const convertedEmails: Email[] = emailData.messages.map(msg => {
          // Format sender name with personal name if available
          let senderName = msg.from
          if (msg.mail_headers?.from?.[0]?.personal) {
            senderName = `${msg.mail_headers.from[0].personal} <${msg.from}>`
          }
          
          return {
            id: msg.id,
            sender: senderName,
            subject: msg.subject,
            preview: msg.text || msg.html || 'No content',
            timestamp: formatDate(msg.date),
            read: msg.read
          }
        })
        
        setEmails(convertedEmails)
        setPagination(emailData.pagination)
        setCurrentPage(page)
        console.log('Emails refreshed successfully for notification')
      } else {
        console.log('Notification refresh - No email data received')
      }
    } catch (error) {
      console.error('Error refreshing emails for notification:', error)
    }
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
      return t('inbox.dateJustNow')
      } else if (diffInHours < 24) {
        return t('inbox.dateHoursAgo', { hours: Math.floor(diffInHours) })
      } else if (diffInHours < 48) {
        return t('inbox.dateYesterday')
      } else {
        return date.toLocaleDateString()
      }
    } catch {
      return t('inbox.dateUnknown')
    }
  }

  const createRandomEmailAccount = async (availableDomains: Domain[]) => {
    try {
      // Select a random domain
      const randomDomain = availableDomains[Math.floor(Math.random() * availableDomains.length)]
      
      // Generate human-like email and strong password
      const { email, password } = generateHumanLikeEmailAccount(randomDomain.name)
      
      // Create the email account via API
      const newAccount = await createEmailAccount(email, password)
      
      // Save to localStorage with unique site key
      const siteKey = getSiteKey()
      const emailData = {
        domains: availableDomains,
        currentAccount: newAccount,
        lastUpdated: new Date().toISOString()
      }
      
      saveEmailData(emailData)
      
      // Update state
      setCurrentAccount(newAccount)
      setEmailAddress(newAccount.email)
      
      // WebSocket authentication will be handled by useEffect when currentAccount changes
      
      toast({
        title: t('inbox.accountCreatedTitle'),
        description: t('inbox.accountCreatedDesc'),
      })
      
    } catch (error) {
      console.error('Error creating email account:', error)
      toast({
        title: t('inbox.toastErrorTitle'),
        description: t('inbox.createAccountError'),
        variant: "destructive"
      })
    }
  }

  const refreshInbox = async () => {
    setRefreshing(true)
    try {
      await loadEmails(currentPage)
      toast({
        title: t('inbox.inboxRefreshed'),
        description: t('inbox.inboxUpdated'),
      })
    } catch (error) {
      console.error('Error refreshing inbox:', error)
      toast({
        title: t('inbox.toastErrorTitle'),
        description: t('inbox.refreshError'),
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const generateNewEmail = async () => {
    try {
      setLoading(true)
      
      // Create a new random email account
      await createRandomEmailAccount(domains)
      
      // Reset pagination for new account
      setCurrentPage(1)
      
    } catch (error) {
      console.error('Error generating new email:', error)
      toast({
        title: t('inbox.toastErrorTitle'),
        description: t('inbox.generateError'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(emailAddress)
    toast({
      title: t('inbox.copiedTitle'),
      description: t('inbox.copiedDesc'),
    })
  }

  const deleteEmailAddress = async () => {
    try {
      setLoading(true)
      
      // Delete the account via API if we have a current account
      if (currentAccount) {
        const deleteSuccess = await deleteEmailAccount(currentAccount.id)
        if (!deleteSuccess) {
          console.warn('Failed to delete account via API, but continuing with local cleanup')
        }
      }
      
      // Clear from localStorage
      clearEmailData()
      
      // Clear state
      setEmailAddress("")
      setEmails([])
      setCurrentAccount(null)
      setCurrentPage(1)
      
      // Create a new account automatically
      await createRandomEmailAccount(domains)
      
      toast({
        title: t('inbox.addressDeletedTitle'),
        description: t('inbox.addressDeletedDesc'),
      })
    } catch (error) {
      console.error('Error deleting email address:', error)
      toast({
        title: t('inbox.toastErrorTitle'),
        description: t('inbox.deleteError'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage)
      // Reset new email count when going to page 1
      if (newPage === 1) {
        setNewEmailCount(0)
      }
    }
  }

  const CustomEmailModal = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [selectedDomain, setSelectedDomain] = useState(domains[0]?.name || "")

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!username || !selectedDomain) return

      try {
        setLoading(true)
        setCustomEmailOpen(false)

        // Use provided password or generate a new one
        const finalPassword = password || generateStrongPassword()
        const email = `${username}@${selectedDomain}`

        // Create the email account via API
        const newAccount = await createEmailAccount(email, finalPassword)
        
        // Save to localStorage
        const emailData = {
          domains: domains,
          currentAccount: newAccount,
          lastUpdated: new Date().toISOString()
        }
        
        saveEmailData(emailData)
        
        // Update state
        setCurrentAccount(newAccount)
        setEmailAddress(newAccount.email)
        setCurrentPage(1)
        setPassword("") // Clear password field
        
        // WebSocket authentication will be handled by useEffect when currentAccount changes
        
        toast({
          title: "Custom email address generated",
          description: "Your custom temporary email address has been created.",
        })
      } catch (error) {
        console.error('Error creating custom email:', error)
        toast({
          title: "Error",
          description: "Failed to create custom email address. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    return (
      <Dialog open={customEmailOpen} onOpenChange={setCustomEmailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('inbox.modalTitle')}</DialogTitle>
            <DialogDescription>{t('inbox.modalDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="username" className="text-right text-sm font-medium">
                  {t('inbox.labelUsername')}
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('inbox.placeholderUsername')}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="domain" className="text-right text-sm font-medium">
                  {t('inbox.labelDomain')}
                </label>
                <select
                  id="domain"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.name}>
                      @{domain.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="password" className="text-right text-sm font-medium">
                  {t('inbox.labelPassword')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('inbox.placeholderPassword')}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{t('inbox.btnCreateEmail')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('inbox.title')}</CardTitle>
          <CardDescription>{t('inbox.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md font-mono text-sm flex-1 w-full truncate">
                {loading ? t('inbox.loading') : emailAddress || t('inbox.noEmail')}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  className="flex-1 sm:flex-none" 
                  variant="outline" 
                  onClick={copyEmailToClipboard}
                  disabled={loading || !emailAddress}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('inbox.copy')}
                </Button>
                <Button
                  className="flex-1 sm:flex-none"
                  variant="destructive"
                  onClick={deleteEmailAddress}
                  disabled={loading}
                >
                  <RotateCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  {t('inbox.delete')}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <Button className="flex-1" variant="default" onClick={generateNewEmail} disabled={loading}>
                <RotateCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {t('inbox.newRandom')}
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => setCustomEmailOpen(true)} disabled={loading}>
                <RotateCw className="h-4 w-4 mr-2" />
                {t('inbox.customEmail')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="w-full my-6">
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_1 ? (
          <GoogleAdsense
            client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID as string}
            slot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_1 as string}
            type="auto"
          />
        ) : (
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('inbox.ad')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('inbox.heading')}</h2>
          {newEmailCount > 0 && currentPage !== 1 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="animate-pulse">
                {t('inbox.newEmailsBadge', { count: newEmailCount })}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(1)}
                className="text-xs"
              >
                {t('inbox.viewNew')}
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* WebSocket Status Indicator */}
          {wsEnabled && (
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  {t('inbox.live')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  {t('inbox.connecting')}
                </Badge>
              )}
            </div>
          )}
          
          {pagination.total_items > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('inbox.paginationSummary', { total: pagination.total_items, current: pagination.current_page, totalPages: pagination.total_pages })}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={refreshInbox} disabled={refreshing || loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {t('inbox.refresh')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <EmailSkeleton />
          <EmailSkeleton />
          <EmailSkeleton />
        </div>
      ) : emails.length > 0 ? (
        <>
          {refreshingForNewEmails && (
            <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">{t('inbox.updating')}</span>
            </div>
          )}
          <EmailList 
            emails={emails} 
            currentAccount={currentAccount} 
            rawMessagesById={rawMessagesById}
            onEmailDeleted={() => loadEmails(currentPage)} 
          />
          
          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                {t('inbox.prev')}
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.total_pages - 4, currentPage - 2)) + i
                  if (pageNum > pagination.total_pages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.total_pages}
              >
                {t('inbox.next')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">{t('inbox.emptyTitle')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('inbox.emptySubtitle')}</p>
        </div>
      )}
      <CustomEmailModal />
      <Toaster />
    </div>
  )
}

function EmailSkeleton() {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 flex gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}
