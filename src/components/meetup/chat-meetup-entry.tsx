import { Button } from "@/components/ui/button"
import {
    resolveChatMeetupEntryActionState,
} from "@/components/meetup/chat-meetup-entry-rules"
import { transitionMeetup } from "@/meetup/state-machine"
import type { ActorRole, MeetupMachine } from "@/meetup/types"

type ChatMeetupEntryProps = {
    meetup: MeetupMachine
    actorRole: ActorRole
    currentTime: Date
    onMeetupChange: (next: MeetupMachine) => void
    onError: (message: string) => void
}

function ChatMeetupEntry({
    meetup,
    actorRole,
    currentTime,
    onMeetupChange,
    onError,
}: ChatMeetupEntryProps) {
    const actionState = resolveChatMeetupEntryActionState(meetup, actorRole)

    if (!actionState.visible) {
        return null
    }

    const startMeetup = () => {
        const result = transitionMeetup(meetup, {
            type: "PROPOSE",
            actorRole,
            occurredAt: currentTime,
        })

        if (!result.ok) {
            onError(result.reason)
            return
        }

        onError("")
        onMeetupChange(result.meetup)
    }

    return (
        <section className="rounded-[12px] border border-[#D3DEE2] bg-white p-4">
            <p className="font-wallie-fit text-[12px] text-[#6E8792]">Entrada desde chat</p>
            <h2 className="font-wallie-fit text-[16px] text-[#253238]">
                Conversacion {meetup.chatContext.conversationId}
            </h2>
            <p className="mt-1 font-wallie-fit text-[13px] text-[#4A5A63]">
                Anuncio {meetup.chatContext.listingId}
            </p>
            <p className="mt-1 font-wallie-fit text-[13px] text-[#4A5A63]">
                {actionState.message}
            </p>
            <div className="mt-4">
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={startMeetup}
                    disabled={!actionState.enabled}
                >
                    Proponer meetup
                </Button>
            </div>
        </section>
    )
}

export { ChatMeetupEntry }
