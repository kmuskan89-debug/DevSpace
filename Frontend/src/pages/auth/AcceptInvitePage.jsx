import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { useWorkspaceContext } from '../../context/WorkspaceContext';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

export function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchWorkspaces } = useWorkspaceContext();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Missing invitation token.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get(`/invitations/verify/${token}`);
        setInvitation(res.data?.invitation);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation token.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/invitations/accept/${token}`);
      addToast(res.data?.message || 'Successfully joined workspace!', 'success');
      await fetchWorkspaces();
      const targetSlug = res.data?.workspace?.slug || res.data?.workspace?._id || invitation?.workspace?._id;
      navigate(`/workspace/${targetSlug}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to accept invitation.', 'error');
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await api.post(`/invitations/reject/${token}`);
      addToast('Invitation declined.', 'info');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject invitation.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-2.5 text-center">
        <Loader2 className="w-5 h-5 text-[#777777] dark:text-[#A0A0A0] animate-spin" />
        <p className="text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
          Verifying workspace invitation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] bg-[#FFFFFF] dark:bg-[#202020] p-6 text-center space-y-4 shadow-xs">
        <div className="w-9 h-9 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] text-[#D83B01] dark:text-[#F87171] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Invitation Unavailable</h2>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed">{error}</p>
        </div>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const workspace = invitation?.workspace;
  const inviter = invitation?.invitedBy;

  return (
    <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] p-6 sm:p-7 shadow-xs text-center space-y-5">
      <div className="w-9 h-9 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] text-[#252525] dark:text-[#F2F2F2] flex items-center justify-center mx-auto">
        <Users className="w-4 h-4" />
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
          Workspace Invitation
        </span>
        <h2 className="text-lg font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
          Join &ldquo;{workspace?.name}&rdquo;
        </h2>
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-1 leading-relaxed">
          <strong className="text-[#252525] dark:text-[#F2F2F2]">{inviter?.name || 'A team administrator'}</strong> invited you to collaborate as{' '}
          <span className="px-1.5 py-0.2 rounded bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535] font-mono text-[11px] font-medium">
            {invitation?.role}
          </span>
        </p>
      </div>

      {workspace?.description && (
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] bg-[#F7F7F5] dark:bg-[#1C1C1C] p-3 rounded-md border border-[#E8E8E5] dark:border-[#353535] text-left leading-relaxed">
          {workspace.description}
        </p>
      )}

      {isAuthenticated ? (
        <div className="space-y-2 pt-1">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center h-9 text-xs font-medium"
            onClick={handleAccept}
            disabled={isProcessing}
          >
            {isProcessing ? 'Accepting...' : 'Accept Invitation & Join'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-[#777777] dark:text-[#A0A0A0] hover:text-[#D83B01] dark:hover:text-[#F87171]"
            onClick={handleReject}
            disabled={isProcessing}
          >
            Decline Invitation
          </Button>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-[#B26B00] dark:text-[#FBBF24] bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)] p-2.5 rounded-md">
            Please sign in or create an account to accept this invitation.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => navigate(`/login?redirect=/invite/${token}`)}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => navigate(`/register?redirect=/invite/${token}`)}
            >
              Register
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcceptInvitePage;
