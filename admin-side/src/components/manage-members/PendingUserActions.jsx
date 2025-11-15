import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X } from 'lucide-react';

const PendingUserActions = ({ user, onApprove, onDeny }) => {
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'deny' | null

  const handleConfirm = () => {
    if (confirmAction === 'approve') onApprove(user.id);
    if (confirmAction === 'deny') onDeny(user.id);
    setConfirmAction(null);
  };

  return (
    <div className="flex gap-2 justify-center relative">
      <Button
        size="sm"
        variant="default"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmAction('approve');
        }}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmAction('deny');
        }}
      >
        Deny
      </Button>

      {/* Confirmation Popup */}
      {confirmAction && (
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10 animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="font-semibold text-gray-700 text-sm">
              Are you sure you want to{' '}
              {confirmAction === 'approve' ? 'approve' : 'deny'} this user?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction(null)}
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              variant={confirmAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirm}
            >
              {confirmAction === 'approve' ? (
                <>
                  <Check className="w-4 h-4 mr-1" /> Approve
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-1" /> Deny
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingUserActions;
