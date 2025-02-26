import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dispatch, SetStateAction } from "react"

interface DeleteConfirmationDialogProps {
  confirmation: {
    isOpen: boolean;
    fileId: string | null;
  }
  setConfirmation: Dispatch<SetStateAction<{
    isOpen: boolean;
    fileId: string | null;
    fileName: string | null;
  }>>
  onDeleteConfirm?: () => void
}

export function DeleteConfirmationDialog({ confirmation, setConfirmation, onDeleteConfirm }: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog
      open={confirmation.isOpen}
      onOpenChange={(isOpen) => setConfirmation({ isOpen, fileId: null, fileName: null })}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete File</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to move this file to trash? You can restore it from the trash bin later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDeleteConfirm}>
            Move to Trash
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}