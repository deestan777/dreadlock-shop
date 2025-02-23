const NOVA_POSHTA_API_KEY = process.env.NOVA_POSHTA_API_KEY || ""

export interface Area {
  Ref: string
  AreasCenter: string
  DescriptionRu: string
  Description: string
}

export interface City {
  Ref: string
  Description: string
  DescriptionRu: string
  Area: string
  SettlementType: string
  IsBranch: string
}

export interface PostOffice {
  Ref: string
  Description: string
  ShortAddress: string
  Phone: string
  TypeOfWarehouse: string
  Number: string
  CityRef: string
  CityDescription: string
}

export async function getAreas(): Promise<Area[]> {
  try {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: NOVA_POSHTA_API_KEY,
        modelName: "Address",
        calledMethod: "getAreas",
        methodProperties: {},
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Nova Poshta API error:", errorData)
      throw new Error(`Nova Poshta API error: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      console.error("Nova Poshta API error:", data)
      throw new Error(data.errors?.join(", ") || "Failed to fetch areas")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching Nova Poshta areas:", error)
    throw error
  }
}

export async function getCities(areaRef: string): Promise<City[]> {
  try {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: NOVA_POSHTA_API_KEY,
        modelName: "Address",
        calledMethod: "getCities",
        methodProperties: {
          AreaRef: areaRef,
          Limit: 1000,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Nova Poshta API error:", errorData)
      throw new Error(`Nova Poshta API error: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      console.error("Nova Poshta API error:", data)
      throw new Error(data.errors?.join(", ") || "Failed to fetch cities")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching Nova Poshta cities:", error)
    throw error
  }
}

export async function searchPostOffices(cityRef: string): Promise<PostOffice[]> {
  try {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: NOVA_POSHTA_API_KEY,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cityRef,
          Limit: 1000,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Nova Poshta API error:", errorData)
      throw new Error(`Nova Poshta API error: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      console.error("Nova Poshta API error:", data)
      throw new Error(data.errors?.join(", ") || "Failed to fetch post offices")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching Nova Poshta offices:", error)
    throw error
  }
}

