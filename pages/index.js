// pages/index.js
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import FrameWelcome from '../components/FrameWelcome';
import FrameQA from '../components/FrameQA';
import FrameReport from '../components/FrameReport';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [page, setPage]                 = useState('welcome');
  const [accounts, setAccounts]         = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [currentTask, setCurrentTask]   = useState(null);
  const [step1Results, setStep1Results] = useState({ checks: {}, comments: '' });
  const [step2Results, setStep2Results] = useState({ checks: {}, comments: '' });
  const [finalNotes, setFinalNotes]     = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    axios
      .get('/api/accounts')
      .then(r => setAccounts(r.data.accounts))
      .catch(() => setError('Failed to load accounts.'));
  }, []);

  // now takes two args: Drive URL + account ID
  const startQA = (driveUrl, accountId) => {
    if (!driveUrl || !accountId) {
      return alert('Please select both a Drive video and an account');
    }
    setLoading(true);
    setError('');
    axios
      .get('/api/qa/next', {
        params: { account: accountId, drive: driveUrl }
      })
      .then(r => {
        if (r.data.success) {
          // <-- r.data.task is now a full object
          setCurrentTask(r.data.task);
          setStep1Results({ checks: {}, comments: '' });
          setStep2Results({ checks: {}, comments: '' });
          setFinalNotes('');
          setPage('qa-step-1');
        } else {
          alert(r.data.message);
        }
      })
      .catch(() => setError('Failed to claim QA task.'))
      .finally(() => setLoading(false));
  };

  const finishStep = (step, checks, comments) => {
    if (step === 1) {
      setStep1Results({ checks, comments });
      setPage('qa-step-2');
    } else {
      setStep2Results({ checks, comments });
      setPage('qa-report');
    }
  };

  const submitFinal = () => {
    setLoading(true);
    axios
      .post('/api/qa/complete', {
        qa_task_id: currentTask.qa_task_id,
        final_notes: finalNotes
      })
      .then(r => {
        if (r.data.success) {
          alert('QA completed successfully! Notifications sent to Discord and Trello.');
          setPage('welcome');
          setCurrentTask(null);
        } else {
          alert('Error: ' + r.data.message);
        }
      })
      .catch(() => setError('Failed to submit QA.'))
      .finally(() => setLoading(false));
  };

  // Show loading while checking authentication or during operations
  if (authLoading || loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
          }}
        >
          <CircularProgress size={60} sx={{ color: '#304ffe' }} />
        </Box>
      </Layout>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Box sx={{ minHeight: '60vh' }}>
        {page === 'welcome' && (
          <FrameWelcome
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
            onStart={startQA}
            error={error}
          />
        )}

        {page === 'qa-step-1' && currentTask && (
          <FrameQA
            step={1}
            task={currentTask}
            onNext={(checks, comments) => finishStep(1, checks, comments)}
          />
        )}

        {page === 'qa-step-2' && currentTask && (
          <FrameQA
            step={2}
            task={currentTask}
            onNext={(checks, comments) => finishStep(2, checks, comments)}
          />
        )}

        {page === 'qa-report' && currentTask && (
          <FrameReport
            task={currentTask}
            step1Results={step1Results}
            step2Results={step2Results}
            finalNotes={finalNotes}
            onFinalNotesChange={setFinalNotes}
            onSubmit={submitFinal}
          />
        )}
      </Box>
    </Layout>
  );
}
