import { getActiveOriginSync } from './backendDiscovery';

export interface GraphQLVariant {
  _id: string;
  size: string;
  price: number;
  quantityInStock: number;
  sku: string;
  isDefault: boolean;
}

export interface GraphQLBrandInfo {
  name: string;
  logo: string | null;
  description: string;
  origin: string;
}

export interface GraphQLProductDetail {
  _id: string;
  name: string;
  brand: string;
  brandInfo: GraphQLBrandInfo | null;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  description: string;
  tag: string;
  discount: number;
  reviewsCount: number;
  soldCount: number;
  categories: string[];
  variants: GraphQLVariant[];
  size: string;
  quantityInStock: number;
  longevity: string;
  sillage: string;
  durability: string;
  scentTrail: string;
  style: string;
  suitableFor: string;
  occasion: string;
  season: string;
  time: string;
}

export interface GraphQLProduct {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  image: string;
  tag: string | null;
  discount: number | null;
  reviewsCount: number | null;
  soldCount: number | null;
  quantityInStock: number;
}

export interface GraphQLBrand {
  _id: string;
  name: string;
  logo: string | null;
  status: string;
}

export interface HomepageData {
  sale: GraphQLProduct[];
  new: GraphQLProduct[];
  hot: GraphQLProduct[];
  limited: GraphQLProduct[];
  standard: GraphQLProduct[];
  brands: GraphQLBrand[];
}

export interface NavbarData {
  trending: GraphQLProduct[];
  brandNames: string[];
}

const HOMEPAGE_QUERY = `#graphql
  query Homepage {
    homepage {
      sale { _id name brand price originalPrice image tag discount reviewsCount soldCount quantityInStock }
      new { _id name brand price originalPrice image tag discount reviewsCount soldCount quantityInStock }
      hot { _id name brand price originalPrice image tag discount reviewsCount soldCount quantityInStock }
      limited { _id name brand price originalPrice image tag discount reviewsCount soldCount quantityInStock }
      standard { _id name brand price originalPrice image tag discount reviewsCount soldCount quantityInStock }
      brands { _id name logo status }
    }
  }
`;

const NAVBAR_QUERY = `#graphql
  query Navbar {
    navbar {
      trending { _id name brand price originalPrice discount image quantityInStock }
      brandNames
    }
  }
`;

const EMPTY_HOMEPAGE: HomepageData = {
  sale: [], new: [], hot: [], limited: [], standard: [], brands: [],
};

export async function fetchHomepage(): Promise<HomepageData> {
  const origin = getActiveOriginSync();
  const url = `${origin.replace(/\/+$/, '')}/api/graphql`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: HOMEPAGE_QUERY,
      }),
    });
  } catch (e) {
    console.warn('[GraphQL] Network error, returning empty homepage:', e);
    return EMPTY_HOMEPAGE;
  }

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    console.warn('[GraphQL] JSON parse error, returning empty homepage:', e);
    return EMPTY_HOMEPAGE;
  }

  if (json.errors) {
    console.warn('[GraphQL] homepage errors, returning empty:', json.errors);
    return EMPTY_HOMEPAGE;
  }

  if (!json.data || !json.data.homepage) {
    console.warn('[GraphQL] empty data, returning empty homepage');
    return EMPTY_HOMEPAGE;
  }

  return json.data.homepage as HomepageData;
}

export async function fetchNavbarData(): Promise<NavbarData> {
  const origin = getActiveOriginSync();
  const url = `${origin.replace(/\/+$/, '')}/api/graphql`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: NAVBAR_QUERY,
      }),
    });
  } catch (e) {
    console.warn('[GraphQL] Navbar network error:', e);
    return { trending: [], brandNames: [] };
  }

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    console.warn('[GraphQL] Navbar JSON parse error:', e);
    return { trending: [], brandNames: [] };
  }

  if (json.errors || !json.data || !json.data.navbar) {
    console.warn('[GraphQL] Navbar empty data');
    return { trending: [], brandNames: [] };
  }

  return json.data.navbar as NavbarData;
}
const PRODUCT_DETAIL_QUERY = `#graphql
  query ProductDetail($id: ID!) {
    productDetail(id: $id) {
      _id name brand
      brandInfo { name logo description origin }
      price originalPrice image images description tag
      discount reviewsCount soldCount
      categories
      variants { _id size price quantityInStock sku isDefault }
      size quantityInStock
      longevity sillage durability scentTrail
      style suitableFor occasion season time
    }
    trendingProducts(limit: 8) {
      _id name brand price originalPrice image tag discount reviewsCount soldCount quantityInStock
    }
  }
`;

export async function fetchProductDetail(id: string) {
  const origin = getActiveOriginSync();
  const url = `${origin.replace(/\/+$/, '')}/api/graphql`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: PRODUCT_DETAIL_QUERY,
        variables: { id },
      }),
    });

    const json = await res.json();

    if (json.errors) {
      console.warn('[GraphQL] productDetail errors:', json.errors);
      return { productDetail: null, trendingProducts: [] };
    }

    if (!json.data) {
      return { productDetail: null, trendingProducts: [] };
    }

    return {
      productDetail: json.data.productDetail as GraphQLProductDetail | null,
      trendingProducts: (json.data.trendingProducts || []) as GraphQLProduct[],
    };
  } catch (e) {
    console.warn('[GraphQL] productDetail network error:', e);
    return { productDetail: null, trendingProducts: [] };
  }
}
