type MeetupProposalFooterProps = {
  listingImageSrc?: string
  itemTitle: string
  userName: string
  actionLabel: string
  onAction: () => void
  actionDisabled?: boolean
  actionTextTone?: "dark" | "light"
}

function MeetupProposalFooter({
  listingImageSrc,
  itemTitle,
  userName,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionTextTone = "dark",
}: MeetupProposalFooterProps) {
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
              <p className="truncate font-wallie-fit text-[12px] leading-tight text-[#6E8792]">
                Proponer quedada
              </p>
              <p className="truncate font-wallie-chunky text-[15px] leading-tight text-[#253238]">
                {userName}
              </p>
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
                ? "cursor-not-allowed bg-[#B6C4CB] text-[#0F252B]"
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
