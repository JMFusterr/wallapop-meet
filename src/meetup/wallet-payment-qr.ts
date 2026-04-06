import type { MeetupMachine } from "@/meetup/types"

/**
 * Carga util para el QR de pago presencial con Wallet.
 * El payload sigue un esquema tipo deep link para que la app de Wallapop lo interprete.
 */
export function buildWalletInPersonPayPayload(meetup: MeetupMachine): string {
    const amount = meetup.finalPrice ?? 0
    const { listingId, buyerUserId } = meetup.chatContext
    const params = new URLSearchParams({
        meetupId: meetup.id,
        listingId,
        buyerUserId,
        amountEur: String(amount),
    })
    return `wallapop://wallet-inperson-pay?${params.toString()}`
}
