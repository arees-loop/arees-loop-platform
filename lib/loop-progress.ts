export type VerifiedVisit = {
  experienceId: string;
  verifiedAt: string;
  points: number;
};

export type RewardRedemption = {
  rewardId: number;
  rewardTitle: string;
  points: number;
  redeemedAt: string;
};

export type LoopProgressState = {
  verifiedVisits: VerifiedVisit[];
  missionRewardsClaimed: number[];
  rewardRedemptions: RewardRedemption[];
};

const STORAGE_KEY = "arees_loop_progress";

const MISSION_REWARDS: Record<number, number> = {
  1: 150,
  2: 250,
  3: 500,
  4: 750,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function getDefaultState(): LoopProgressState {
  return {
    verifiedVisits: [],
    missionRewardsClaimed: [],
    rewardRedemptions: [],
  };
}

export function getLoopProgress(): LoopProgressState {
  if (!isBrowser()) {
    return getDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return getDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<LoopProgressState>;

    return {
      verifiedVisits: Array.isArray(parsed.verifiedVisits)
        ? parsed.verifiedVisits
        : [],

      missionRewardsClaimed: Array.isArray(parsed.missionRewardsClaimed)
        ? parsed.missionRewardsClaimed
        : [],

      rewardRedemptions: Array.isArray(parsed.rewardRedemptions)
        ? parsed.rewardRedemptions
        : [],
    };
  } catch {
    return getDefaultState();
  }
}

function saveLoopProgress(state: LoopProgressState) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addVerifiedVisit(
  experienceId: string,
  points: number
): LoopProgressState {
  const current = getLoopProgress();

  const alreadyVerified = current.verifiedVisits.some(
    (visit) => visit.experienceId === experienceId
  );

  if (alreadyVerified) {
    return current;
  }

  const nextState: LoopProgressState = {
    ...current,

    verifiedVisits: [
      ...current.verifiedVisits,
      {
        experienceId,
        verifiedAt: new Date().toISOString(),
        points,
      },
    ],
  };

  saveLoopProgress(nextState);

  return nextState;
}

export function hasVerifiedVisit(experienceId: string): boolean {
  return getLoopProgress().verifiedVisits.some(
    (visit) => visit.experienceId === experienceId
  );
}

export function getVerifiedVisitsCount(): number {
  return getLoopProgress().verifiedVisits.length;
}

export function getVerifiedVisitPoints(): number {
  return getLoopProgress().verifiedVisits.reduce(
    (total, visit) => total + visit.points,
    0
  );
}

export function hasClaimedMissionReward(missionId: number): boolean {
  return getLoopProgress().missionRewardsClaimed.includes(missionId);
}

export function claimMissionReward(missionId: number): LoopProgressState {
  const current = getLoopProgress();

  if (current.missionRewardsClaimed.includes(missionId)) {
    return current;
  }

  const nextState: LoopProgressState = {
    ...current,

    missionRewardsClaimed: [
      ...current.missionRewardsClaimed,
      missionId,
    ],
  };

  saveLoopProgress(nextState);

  return nextState;
}

export function getMissionRewardPoints(): number {
  return getLoopProgress().missionRewardsClaimed.reduce(
    (total, missionId) => total + (MISSION_REWARDS[missionId] ?? 0),
    0
  );
}

export function getEarnedLoopPoints(): number {
  return getVerifiedVisitPoints() + getMissionRewardPoints();
}

export function getRedeemedLoopPoints(): number {
  return getLoopProgress().rewardRedemptions.reduce(
    (total, redemption) => total + redemption.points,
    0
  );
}

export function getTotalLoopPoints(): number {
  return Math.max(
    0,
    getEarnedLoopPoints() - getRedeemedLoopPoints()
  );
}

export function hasRedeemedReward(rewardId: number): boolean {
  return getLoopProgress().rewardRedemptions.some(
    (redemption) => redemption.rewardId === rewardId
  );
}

export function redeemReward(
  rewardId: number,
  rewardTitle: string,
  points: number
): {
  success: boolean;
  reason?: "ALREADY_REDEEMED" | "INSUFFICIENT_POINTS";
  state: LoopProgressState;
} {
  const current = getLoopProgress();

  const alreadyRedeemed = current.rewardRedemptions.some(
    (redemption) => redemption.rewardId === rewardId
  );

  if (alreadyRedeemed) {
    return {
      success: false,
      reason: "ALREADY_REDEEMED",
      state: current,
    };
  }

  const availablePoints = getTotalLoopPoints();

  if (availablePoints < points) {
    return {
      success: false,
      reason: "INSUFFICIENT_POINTS",
      state: current,
    };
  }

  const nextState: LoopProgressState = {
    ...current,

    rewardRedemptions: [
      ...current.rewardRedemptions,
      {
        rewardId,
        rewardTitle,
        points,
        redeemedAt: new Date().toISOString(),
      },
    ],
  };

  saveLoopProgress(nextState);

  return {
    success: true,
    state: nextState,
  };
}

export function resetLoopProgress() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}