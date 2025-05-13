import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from "@fluentui/react-components";
import React from "react";

interface InfoDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onClose: () => void;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ isOpen, title, message, onClose }) => {
  return (
    <Dialog open={isOpen} modalType="alert">
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{message}</DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
