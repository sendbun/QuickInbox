"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Download, Printer } from "lucide-react"
import { useTranslations } from "next-intl"
import type { EmailMessage } from "@/lib/email-service"

type EmailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedEmail: EmailMessage | null
  onDelete: (id: string) => void
  onDownload: () => void
  onPrint: () => void
}

export function EmailModal({
  open,
  onOpenChange,
  selectedEmail,
  onDelete,
  onDownload,
  onPrint
}: EmailModalProps) {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{selectedEmail?.subject}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-center mb-4 text-sm">
          <div>
            <p>
              <strong>{t('modal.from') || 'From'}:</strong> {selectedEmail?.from}
            </p>
            <p>
              <strong>{t('modal.date') || 'Date'}:</strong> {selectedEmail?.date ? new Date(selectedEmail.date).toLocaleString() : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedEmail && onDelete(selectedEmail.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('modal.delete')}
            </Button>
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              {t('modal.download')}
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t('modal.print')}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto border rounded-md p-4">
          {selectedEmail && (
            <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


