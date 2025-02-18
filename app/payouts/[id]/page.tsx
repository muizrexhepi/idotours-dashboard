import PayoutDetails from "../payout-deails"

export default function PayoutPage({ params }: { params: { id: string } }) {
  return <PayoutDetails id={params.id} />
}

