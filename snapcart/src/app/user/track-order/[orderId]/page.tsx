import TrackOrderClient from './TrackOrderClient';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

const TrackOrderPage = async ({ params }: PageProps) => {
  const { orderId } = await params;
  return <TrackOrderClient orderId={orderId} />;
};

export default TrackOrderPage;
