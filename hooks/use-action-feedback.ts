"use client";

import { useCallback, useState } from "react";

export type ActionFeedbackStatus = "idle" | "running" | "success" | "error";

export interface ActionFeedbackLabels {
  idle: string;
  running: string;
  success: string;
  error?: string;
}

export const getActionFeedbackLabel = (
  status: ActionFeedbackStatus,
  labels: ActionFeedbackLabels
) => {
  if (status === "running") {
    return labels.running;
  }

  if (status === "success") {
    return labels.success;
  }

  if (status === "error") {
    return labels.error ?? "Retry";
  }

  return labels.idle;
};

export const getActionFeedbackClassName = (status: ActionFeedbackStatus) => {
  if (status === "success") {
    return "border-emerald-500/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (status === "error") {
    return "border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive";
  }

  return "";
};

export const useActionFeedback = <ActionKey extends string>(
  initialStatuses: Record<ActionKey, ActionFeedbackStatus>
) => {
  const [statuses, setStatuses] = useState(initialStatuses);

  const setStatus = useCallback(
    (key: ActionKey, status: ActionFeedbackStatus) => {
      setStatuses((current) => {
        if (current[key] === status) {
          return current;
        }

        return {
          ...current,
          [key]: status,
        };
      });
    },
    []
  );

  const resetStatus = useCallback(
    (key: ActionKey) => {
      setStatus(key, "idle");
    },
    [setStatus]
  );

  const runAction = useCallback(
    async <Result,>(
      key: ActionKey,
      action: () => Promise<Result> | Result
    ): Promise<Result> => {
      setStatus(key, "running");

      try {
        const result = await action();
        setStatus(key, "success");
        return result;
      } catch (error) {
        setStatus(key, "error");
        throw error;
      }
    },
    [setStatus]
  );

  return {
    statuses,
    setStatus,
    resetStatus,
    runAction,
  };
};
