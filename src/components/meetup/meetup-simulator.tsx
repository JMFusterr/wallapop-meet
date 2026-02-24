import * as React from "react"

import { ChatMeetupEntry } from "@/components/meetup/chat-meetup-entry"
import { MeetupCard } from "@/components/meetup/meetup-card"
import { Button } from "@/components/ui/button"
import { createMeetupMachine } from "@/meetup/state-machine"
import type { ActorRole, MeetupChatContext, MeetupMachine } from "@/meetup/types"

const HALF_HOUR_MS = 30 * 60 * 1000
const TEN_MINUTES_MS = 10 * 60 * 1000
const THREE_HOURS_MS = 3 * 60 * 60 * 1000

function MeetupSimulator() {
    const scheduledAt = React.useMemo(() => {
        const now = new Date()
        return new Date(now.getTime() + HALF_HOUR_MS)
    }, [])
    const chatContext = React.useMemo<MeetupChatContext>(
        () => ({
            conversationId: "conv-simulator-001",
            listingId: "listing-simulator-001",
            sellerUserId: "user-seller-simulator-001",
            buyerUserId: "user-buyer-simulator-001",
        }),
        []
    )
    const [machine, setMachine] = React.useState<MeetupMachine>(() =>
        createMeetupMachine({ scheduledAt, chatContext })
    )
    const [actorRole, setActorRole] = React.useState<ActorRole>("SELLER")
    const [currentTime, setCurrentTime] = React.useState<Date>(() => new Date())
    const [lastError, setLastError] = React.useState<string>("")

    return (
        <section className="w-full rounded-[16px] border border-[var(--wm-color-border-default)] bg-white p-5 shadow-[0_1px_2px_rgba(37,50,56,0.1)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-wallie-fit text-[12px] text-[#6E8792]">
                        Wallapop Meet Demo
                    </p>
                    <h1 className="font-wallie-chunky text-[24px] leading-8 text-[#253238]">
                        Flujo de meetup
                    </h1>
                </div>
                <div className="flex items-center gap-2" role="tablist" aria-label="Rol actor">
                    <Button
                        variant="tab"
                        role="tab"
                        aria-selected={actorRole === "SELLER"}
                        data-selected={actorRole === "SELLER"}
                        onClick={() => setActorRole("SELLER")}
                    >
                        Seller
                    </Button>
                    <Button
                        variant="tab"
                        role="tab"
                        aria-selected={actorRole === "BUYER"}
                        data-selected={actorRole === "BUYER"}
                        onClick={() => setActorRole("BUYER")}
                    >
                        Buyer
                    </Button>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button
                    variant="inline_action"
                    size="sm"
                    onClick={() =>
                        setCurrentTime(new Date(machine.scheduledAt.getTime() - TEN_MINUTES_MS))
                    }
                >
                    Simular -10m
                </Button>
                <Button
                    variant="inline_action"
                    size="sm"
                    onClick={() => setCurrentTime(new Date(machine.scheduledAt))}
                >
                    Simular hora exacta
                </Button>
                <Button
                    variant="inline_action"
                    size="sm"
                    onClick={() =>
                        setCurrentTime(new Date(machine.scheduledAt.getTime() + THREE_HOURS_MS))
                    }
                >
                    Simular +3h
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setMachine(createMeetupMachine({ scheduledAt, chatContext }))
                        setCurrentTime(new Date())
                        setLastError("")
                    }}
                >
                    Reiniciar
                </Button>
            </div>

            <p className="mt-3 font-wallie-fit text-[13px] text-[#4A5A63]">
                Hora simulada: {currentTime.toLocaleString()}
            </p>

            <div className="mt-4">
                <ChatMeetupEntry
                    meetup={machine}
                    actorRole={actorRole}
                    currentTime={currentTime}
                    onMeetupChange={setMachine}
                    onError={setLastError}
                />
            </div>

            <div className="mt-4">
                <MeetupCard
                    meetup={machine}
                    actorRole={actorRole}
                    currentTime={currentTime}
                    onMeetupChange={setMachine}
                    onError={setLastError}
                />
            </div>

            {lastError ? (
                <p className="mt-3 rounded-[8px] bg-[#FDEBEC] px-3 py-2 font-wallie-fit text-[13px] text-[#A81F2D]">
                    {lastError}
                </p>
            ) : null}
        </section>
    )
}

export { MeetupSimulator }
