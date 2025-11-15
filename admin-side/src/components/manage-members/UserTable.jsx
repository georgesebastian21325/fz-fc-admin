import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, ArrowUpDown, Mail, Calendar, Clock } from 'lucide-react';

// Placeholder for PendingUserActions component
const PendingUserActions = ({
  user,
  membershipDuration,
  setMembershipDuration,
  onApprove,
  onDeny,
}) => (
  <div className="flex gap-2 justify-center">
    <Button
      size="sm"
      variant="default"
      onClick={(e) => {
        e.stopPropagation();
        onApprove(user.id);
      }}
    >
      Approve
    </Button>
    <Button
      size="sm"
      variant="destructive"
      onClick={(e) => {
        e.stopPropagation();
        onDeny(user.id);
      }}
    >
      Deny
    </Button>
  </div>
);

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
  const calculateRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
  };

  const getRemainingDaysColor = (days) => {
    if (days <= 7) return 'bg-red-50 text-red-700 border-red-200';
    if (days <= 30) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <Card className="mb-8 shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pb-6 ">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="capitalize text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {type} Users
          </CardTitle>
          <Badge variant="secondary" className="text-sm font-semibold">
            {users.length}
          </Badge>
        </div>

        {type === 'verified' && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-gray-100 transition-all duration-200 border-gray-300 shadow-sm"
              onClick={() =>
                sortOptions.setSortOption(sortOptions.sortOption ? '' : 'sort')
              }
            >
              <Filter className="w-4 h-4" />
              Filter & Sort
              <ArrowUpDown className="w-3 h-3" />
            </Button>

            {sortOptions.sortOption && (
              <div className="absolute right-0 mt-2 bg-white shadow-2xl p-3 rounded-xl border border-gray-200 flex flex-col gap-1 z-20 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Sort Options
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={sortOptions.handleSortEmail}
                >
                  <Mail className="w-4 h-4" />
                  Email ({sortOptions.emailSortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
              <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
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
            <tbody className="divide-y divide-gray-100">
              {users.map((user, idx) => {
                const remainingDays = calculateRemainingDays(
                  user.membershipExpiry
                );
                return (
                  <tr
                    key={user.id}
                    className={`${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    } hover:bg-blue-50/50 cursor-pointer transition-all duration-200 hover:shadow-md`}
                    onClick={() => onRowClick(user.id)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
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
                            className={`uppercase text-xs font-semibold px-3 py-1 ${
                              user.active
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200'
                            }`}
                          >
                            {user.active ? '✓ Verified' : '⏳ Pending'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
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
                      <td
                        className="py-4 px-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PendingUserActions
                          user={user}
                          membershipDuration={membershipDuration}
                          setMembershipDuration={setMembershipDuration}
                          onApprove={onApprove}
                          onDeny={onDeny}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No {type} users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTable;
