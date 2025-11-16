import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, ArrowUpDown, Mail, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const UserTable = ({
  users,
  type,
  onRowClick,
  sortOptions,
  membershipDuration,
  setMembershipDuration,
  onApprove,
  onDeny,
}) => {
  const [confirmAction, setConfirmAction] = useState(null);

  const calculateRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
  };

  const getRemainingDaysColor = (days) => {
    if (days <= 7)
      return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200';
    if (days <= 30)
      return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200';
    return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200';
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      onApprove(confirmAction.userId);
    } else {
      onDeny(confirmAction.userId);
    }
    setConfirmAction(null);
  };

  return (
    <>
      <Card className="mb-8 shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pb-6 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="capitalize text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                {type} Users
              </CardTitle>
              <Badge
                variant="secondary"
                className="mt-1 text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
              >
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </Badge>
            </div>
          </div>

          {type === 'verified' && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-green-50 transition-all duration-200 border-green-300 shadow-sm text-green-700 hover:text-green-800"
                onClick={() =>
                  sortOptions.setSortOption(
                    sortOptions.sortOption ? '' : 'sort'
                  )
                }
              >
                <Filter className="w-4 h-4" />
                Filter & Sort
                <ArrowUpDown className="w-3 h-3" />
              </Button>

              {sortOptions.sortOption && (
                <div className="absolute right-0 mt-2 bg-white shadow-2xl p-3 rounded-xl border border-green-200 flex flex-col gap-1 z-20 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                    Sort Options
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 hover:bg-green-50 hover:text-green-700 transition-colors"
                    onClick={sortOptions.handleSortEmail}
                  >
                    <Mail className="w-4 h-4" />
                    Email (
                    {sortOptions.emailSortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 hover:bg-green-50 hover:text-green-700 transition-colors"
                    onClick={sortOptions.handleSortRemainingDays}
                  >
                    <Clock className="w-4 h-4" />
                    Days Remaining (
                    {sortOptions.remainingDaysSortOrder === 'asc'
                      ? 'Low-High'
                      : 'High-Low'}
                    )
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="overflow-x-auto p-0">
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                  <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </th>
                  {type === 'verified' && (
                    <>
                      <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Expiry Date
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Remaining Days
                        </div>
                      </th>
                    </>
                  )}
                  {type === 'pending' && (
                    <th className="py-4 px-6 text-center font-semibold text-sm uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {users.map((user, idx) => {
                  const remainingDays = calculateRemainingDays(
                    user.membershipExpiry
                  );
                  return (
                    <tr
                      key={user.id}
                      className={`${
                        idx % 2 === 0 ? 'bg-white' : 'bg-green-50/30'
                      } hover:bg-green-50 cursor-pointer transition-all duration-200 hover:shadow-sm`}
                      onClick={() => onRowClick(user.id)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {type === 'verified' && (
                        <>
                          <td className="py-4 px-6">
                            <Badge
                              variant={user.active ? 'default' : 'secondary'}
                              className={`uppercase text-xs font-semibold px-3 py-1 shadow-sm ${
                                user.active
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:bg-green-100 border-green-200'
                                  : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 hover:bg-amber-100 border-amber-200'
                              }`}
                            >
                              {user.active ? '✓ Verified' : '⏳ Pending'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <span className="font-medium">
                                {user.membershipExpiry
                                  ? new Date(
                                      user.membershipExpiry
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {user.membershipExpiry ? (
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border font-semibold text-sm ${getRemainingDaysColor(
                                  remainingDays
                                )} shadow-sm`}
                              >
                                <Clock className="w-4 h-4" />
                                {remainingDays} days
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium">
                                N/A
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {type === 'pending' && (
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmAction({
                                  type: 'approve',
                                  userId: user.id,
                                  userEmail: user.email,
                                });
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmAction({
                                  type: 'deny',
                                  userId: user.id,
                                  userEmail: user.email,
                                });
                              }}
                            >
                              Deny
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-gradient-to-b from-white to-green-50/30">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-green-400" />
              </div>
              <p className="text-lg font-semibold text-gray-600">
                No {type} users found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Check back later for updates
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-[450px] rounded-2xl overflow-hidden p-0">
          <div
            className={`p-6 ${
              confirmAction?.type === 'approve'
                ? 'bg-gradient-to-r from-green-600 to-green-500'
                : 'bg-gradient-to-r from-red-600 to-red-500'
            }`}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Confirm{' '}
                {confirmAction?.type === 'approve' ? 'Approval' : 'Denial'}
              </DialogTitle>
              <p
                className={`text-sm ${
                  confirmAction?.type === 'approve'
                    ? 'text-green-100'
                    : 'text-red-100'
                } mt-1`}
              >
                Please review before proceeding
              </p>
            </DialogHeader>
          </div>
          <div className="p-6">
            <p className="text-gray-700 text-base mb-4">
              Are you sure you want to <strong>{confirmAction?.type}</strong>{' '}
              this user?
            </p>
            {confirmAction?.userEmail && (
              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 p-4 rounded-xl border border-green-200 shadow-sm">
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Email:</strong>{' '}
                  {confirmAction.userEmail}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              className="flex-1 hover:bg-gray-100 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 shadow-md ${
                confirmAction?.type === 'approve'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
              }`}
              onClick={handleConfirm}
            >
              {confirmAction?.type === 'approve' ? 'Approve' : 'Deny'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTable;
