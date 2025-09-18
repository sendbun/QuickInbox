"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { deleteEmail, type EmailAccount } from "@/lib/email-service"

interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  timestamp: string
  read: boolean
}

interface EmailListProps {
  emails: Email[]
  currentAccount: EmailAccount | null
  onEmailDeleted: () => void
}

export function EmailList({ emails, currentAccount, onEmailDeleted }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <Card
          key={email.id}
          className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
            !email.read ? "border-l-4 border-l-blue-500" : ""
          }`}
          onClick={() => setSelectedEmail(email)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
                {email.sender.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{email.sender}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                    {email.timestamp}
                  </span>
                </div>
                <h3
                  className={`text-sm ${!email.read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {email.subject}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{email.preview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <EmailDialog 
        email={selectedEmail} 
        open={selectedEmail !== null} 
        onClose={() => setSelectedEmail(null)}
        currentAccount={currentAccount}
        onEmailDeleted={onEmailDeleted}
      />
    </div>
  )
}

interface EmailDialogProps {
  email: Email | null
  open: boolean
  onClose: () => void
  currentAccount: EmailAccount | null
  onEmailDeleted: () => void
}

function EmailDialog({ email, open, onClose, currentAccount, onEmailDeleted }: EmailDialogProps) {
  if (!email) return null

  const handleDelete = async () => {
    try {
      if (!currentAccount) {
        toast({
          title: "Error",
          description: "No email account found. Please refresh the page.",
          variant: "destructive"
        })
        return
      }

      const success = await deleteEmail(currentAccount.id, email.id)
      
      if (success) {
        toast({
          title: "Email deleted",
          description: "The email has been deleted from your inbox.",
        })
        onEmailDeleted() // Refresh the email list
        onClose()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete email. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting email:', error)
      toast({
        title: "Error",
        description: "Failed to delete email. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDownload = () => {
    // In a real app, this would generate and download an .eml file
    const element = document.createElement("a")
    const file = new Blob(
      [
        `From: ${email.sender}\nSubject: ${email.subject}\nDate: ${email.timestamp}\n\n${email.preview}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.`,
      ],
      { type: "text/plain" },
    )
    element.href = URL.createObjectURL(file)
    element.download = `email-${email.id}.eml`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handlePrint = () => {
    // In a real app, this would open the print dialog
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-[100vw] h-[100vh] flex flex-col p-0 gap-0">
        <div className="p-6 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{email.subject}</DialogTitle>
            </div>
            <DialogDescription className="flex justify-between items-center mt-2">
              <span className="font-medium">{email.sender}</span>
              <span className="text-xs">{email.timestamp}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div 
              className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: email.preview }}
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-trash-2 mr-2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
            Delete
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-download mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-printer mr-2"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
