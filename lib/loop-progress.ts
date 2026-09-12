export type VerifiedVisit = {
  experienceId: string;
  verifiedAt: string;
  points: number;
};

type LoopProgressState = {
  verifiedVisits: VerifiedVisit[];
  missionRewardsClaimed: number[];
};

const STORAGE_KEY = "arees_loop_progress";

function isBrowser() {
  return typeof window !== "undefined";
}

function getDefaultState(): LoopProgressState {
  return {
    verifiedVisits: [],
    missionRewardsClaimed: [],
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
  const missionRewards: Record<number, number> = {
    1: 150,
    2: 250,
    3: 500,
    4: 750,
  };

  return getLoopProgress().missionRewardsClaimed.reduce(
    (total, missionId) => total + (missionRewards[missionId] ?? 0),
    0
  );
}

export function getTotalLoopPoints(): number {
  return getVerifiedVisitPoints() + getMissionRewardPoints();
}

export function resetLoopProgress() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}