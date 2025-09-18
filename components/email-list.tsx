"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { deleteEmail, type EmailAccount, type EmailMessage } from "@/lib/email-service"
import { EmailModal } from "@/components/email-modal"

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
  rawMessagesById?: Record<string, EmailMessage>
  onEmailDeleted: () => void
}

export function EmailList({ emails, currentAccount, rawMessagesById = {}, onEmailDeleted }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <Card
          key={email.id}
          className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
            !email.read ? "border-l-4 border-l-blue-500" : ""
          }`}
          onClick={() => { setSelectedEmail(email) }}
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

      <EmailModal
        open={selectedEmail !== null}
        onOpenChange={(open) => { if (!open) setSelectedEmail(null) }}
        selectedEmail={selectedEmail ? rawMessagesById[selectedEmail.id] || null : null}
        onDelete={async (id: string) => {
          if (!currentAccount) return
          const success = await deleteEmail(currentAccount.id, id)
          if (success) {
            toast({ title: 'Email deleted', description: 'The email has been deleted from your inbox.' })
            onEmailDeleted()
            setSelectedEmail(null)
          } else {
            toast({ title: 'Error', description: 'Failed to delete email. Please try again.', variant: 'destructive' })
          }
        }}
        onDownload={() => { /* future: download .eml */ }}
        onPrint={() => window.print()}
      />
    </div>
  )
}

// Legacy inline dialog removed in favor of EmailModal
