The feature is called **Wallapop Meet**, a system to formalize in-person transaction meetups in the Wallapop marketplace.

### Feature Summary

Wallapop Meet turns informal chat agreements into a structured "meetup event" inside the app.  
It aims to:

- Reduce logistic mistakes, forgotten meetups, and ghosting by formalizing the meetup details (date, time, place, price).
- Enable sellers to initiate a meetup proposal.
- Allow buyers to accept or provide a counterproposal.
- Provide interactive push notifications with a lock-screen action button ("I’m here").
- Show a persistent home banner/toast on the day of the meetup.
- Export meetup details to calendar (.ics).
- Ask post-event whether the sale was completed to drive ratings.

---

### Business Logic Expectations

- Only the seller can start a meetup proposal.
- The buyer can accept or counter-propose.
- The event has a clear state machine: PROPOSED -> COUNTER_PROPOSED -> CONFIRMED -> ARRIVED -> COMPLETED/EXPIRED/CANCELLED.
- Push notifications must be interactive and work from lock screen on iOS and Android.
- Arrival logic must respect a time window: 15 minutes before to 2 hours after the scheduled time.
- Map API integration must suggest safe meeting points public places (e.g., stations, malls, police stations).
- Post-meeting follow-up to confirm sale status 24–48h later.