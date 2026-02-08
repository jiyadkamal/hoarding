'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, CheckCircle, XCircle, Shield, User, Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Badge, Modal, Skeleton, Select } from '@/components/ui';
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User as UserType, UserRole } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((docSnap) => ({ uid: docSnap.id, ...docSnap.data() } as UserType));
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserApproval = async (user: UserType, approved: boolean) => {
        setProcessing(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { isApproved: approved });
            setUsers((prev) =>
                prev.map((u) => (u.uid === user.uid ? { ...u, isApproved: approved } : u))
            );
            toast.success(approved ? 'User approved!' : 'User approval revoked');
        } catch (error) {
            toast.error('Failed to update user');
        } finally {
            setProcessing(false);
        }
    };

    const updateUserRole = async (user: UserType, newRole: UserRole) => {
        setProcessing(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u.uid === user.uid ? { ...u, role: newRole } : u))
            );
            toast.success('User role updated');
            setSelectedUser(null);
        } catch (error) {
            toast.error('Failed to update role');
        } finally {
            setProcessing(false);
        }
    };

    const filteredUsers = users
        .filter((user) => {
            if (roleFilter !== 'all' && user.role !== roleFilter) return false;
            return true;
        })
        .filter((user) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                user.displayName?.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        });

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), 'MMM dd, yyyy');
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'owner':
                return 'info';
            case 'advertiser':
                return 'success';
            default:
                return 'neutral';
        }
    };

    return (
        <div className="min-h-screen">
            <Header
                title="User Management"
                subtitle={`${users.length} registered users`}
            />

            <div className="p-8">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[rgba(99,102,241,0.15)] outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'admin', 'owner', 'advertiser'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role as any)}
                                className={`
                  px-4 py-2 rounded-[var(--radius-full)] text-sm font-medium capitalize transition-all
                  ${roleFilter === role
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                    }
                `}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table/Grid */}
                {loading ? (
                    <Card variant="default" className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-[var(--radius-md)]">
                                    <Skeleton variant="circle" size={48} />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton variant="text" className="w-1/4" />
                                        <Skeleton variant="text" className="w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : filteredUsers.length === 0 ? (
                    <Card variant="glass" className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <Users className="w-8 h-8 text-[var(--text-tertiary)]" />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                            No users found
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {searchQuery ? 'Try a different search term' : 'No users registered yet'}
                        </p>
                    </Card>
                ) : (
                    <Card variant="default" className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border-light)]">
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">Joined</th>
                                        <th className="px-6 py-4 text-right text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.uid}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                        {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--text-primary)]">
                                                            {user.displayName || 'No Name'}
                                                        </p>
                                                        <p className="text-sm text-[var(--text-tertiary)]">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isApproved ? (
                                                    <span className="flex items-center gap-1 text-emerald-500 text-sm">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approved
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-500 text-sm">
                                                        <XCircle className="w-4 h-4" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.role !== 'admin' && (
                                                        <>
                                                            {user.isApproved ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => updateUserApproval(user, false)}
                                                                >
                                                                    Revoke
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={() => updateUserApproval(user, true)}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        icon={<Shield className="w-4 h-4" />}
                                                        onClick={() => setSelectedUser(user)}
                                                    >
                                                        Role
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Change Role Modal */}
            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="Change User Role"
                size="sm"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                                {selectedUser.displayName?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">
                                    {selectedUser.displayName || 'No Name'}
                                </p>
                                <p className="text-sm text-[var(--text-tertiary)]">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Select Role
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['advertiser', 'owner', 'admin'] as UserRole[]).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => updateUserRole(selectedUser, role)}
                                        disabled={processing}
                                        className={`
                      p-3 rounded-[var(--radius-md)] border-2 text-center capitalize transition-all
                      ${selectedUser.role === role
                                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                                : 'border-[var(--border-light)] hover:border-[var(--border-medium)]'
                                            }
                      ${processing ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                                    >
                                        <span className="text-sm font-medium text-[var(--text-primary)]">{role}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded-[var(--radius-md)] bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-amber-600">
                                ⚠️ Changing user roles will affect their access permissions immediately.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
