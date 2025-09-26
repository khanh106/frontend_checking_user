import LocationsClient from './LocationsClient'

interface LocationsPageProps {
  searchParams: Promise<{
    search?: string
    status?: 'active' | 'inactive' | 'all'
    page?: string
  }>
}

export default async function LocationsPage({ searchParams }: LocationsPageProps) {
  const params = await searchParams
  
  return <LocationsClient searchParams={params} />
}
