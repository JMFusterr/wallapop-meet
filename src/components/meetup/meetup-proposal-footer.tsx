type MeetupProposalFooterProps = {
  listingImageSrc?: string
  itemTitle: string
  userName: string
  attendanceRate?: number
  attendanceMeetups?: number
  actionLabel: string
  onAction: () => void
  actionDisabled?: boolean
  actionTextTone?: "dark" | "light"
}

function MeetupProposalFooter({
  listingImageSrc,
  itemTitle,
  userName,
  attendanceRate,
  attendanceMeetups,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionTextTone = "dark",
}: MeetupProposalFooterProps) {
  const hasAttendance =
    typeof attendanceRate === "number" &&
    Number.isFinite(attendanceRate) &&
    typeof attendanceMeetups === "number" &&
    attendanceMeetups > 0
  const resolvedAttendanceRate = hasAttendance
    ? Math.max(0, Math.min(100, Math.round(attendanceRate)))
    : null
  const attendanceColorClass =
    resolvedAttendanceRate === null
      ? "text-[#4A5A63]"
      : resolvedAttendanceRate > 90
        ? "text-[var(--wm-color-input-ring-success)]"
        : resolvedAttendanceRate >= 70
          ? "text-[#F4A000]"
          : "text-[var(--wm-color-semantic-error)]"
  const attendanceLabel = hasAttendance
    ? resolvedAttendanceRate !== null && resolvedAttendanceRate < 70
      ? "Baja asistencia a quedadas"
      : `${resolvedAttendanceRate}% de asistencia (${attendanceMeetups})`
    : null

  return (
    <div className="mt-3 border-t border-[#E8ECEF] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={listingImageSrc}
              alt={itemTitle}
              className="h-[42px] w-[42px] shrink-0 rounded-[10px] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-wallie-chunky text-[15px] leading-tight text-[#253238]">
                {userName}
              </p>
              {attendanceLabel ? (
                <p className={`truncate font-wallie-fit text-[12px] leading-tight ${attendanceColorClass}`}>
                  {attendanceLabel}
                </p>
              ) : null}
              <p className="truncate font-wallie-fit text-[12px] leading-tight text-[#4A5A63]">
                {itemTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex justify-end gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-2 font-wallie-chunky text-[14px] ${
              actionDisabled
                ? "cursor-not-allowed border border-[#B8C9CF] bg-[#E8ECEF] text-[#6E8792] shadow-none"
                : actionTextTone === "light"
                  ? "bg-[#13C1AC] text-white"
                  : "bg-[#13C1AC] text-[#0F252B]"
            }`}
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export { MeetupProposalFooter }
export type { MeetupProposalFooterProps }
