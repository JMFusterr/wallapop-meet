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

/** Codigo numerico de 6 digitos para mostrar junto al QR (demo estable por meetup). */
export function deriveWalletDisplayCode(meetup: MeetupMachine): string {
    const seed = `${meetup.id}:${meetup.chatContext.listingId}:${meetup.chatContext.buyerUserId}`
    let h = 0
    for (let i = 0; i < seed.length; i++) {
        h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
    }
    return String(Math.abs(h) % 1_000_000).padStart(6, "0")
}
