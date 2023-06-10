import { ax } from "./axios-client"
import { HeroDetailResponse } from "./types/hero-detail"

export async function getHeroDetails(id: string) {
  const path = "/hero/detail"
  const { data } = await ax.get<HeroDetailResponse>(path, {
    params: { id },
  })
  return data.data
}
