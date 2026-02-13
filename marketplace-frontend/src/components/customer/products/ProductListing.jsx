"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Filter, Grid, List, Star, ChevronLeft, ChevronRight } from "lucide-react"
import customerService from "../../../services/customerService"
import Button from "../../common/Button"
import Loader from "../../common/Loader"

export default function ProductListing({
  onNavigate,
  onSelectProduct,
  onSelectOrder,
  searchQuery,
  onSearchComplete,
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page")) || 1)

  // Handle search query from parent
  useEffect(() => {
    if (searchQuery) {
      const params = Object.fromEntries(searchParams)
      params.search = searchQuery
      params.page = "1"
      setSearchParams(params)
      setCurrentPage(1)
      if (onSearchComplete) {
        onSearchComplete()
      }
    }
  }, [searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const filters = {
        SearchTerm: searchParams.get("search") || "",
        Category: searchParams.get("category") || "",
        MinPrice: searchParams.get("minPrice") || "",
        MaxPrice: searchParams.get("maxPrice") || "",
        InStock: searchParams.get("inStock") === "true",
        SortBy: searchParams.get("sortBy") || "",
        SortOrder: searchParams.get("sortOrder") || "asc",
        PageNumber: currentPage,
        PageSize: 12,
      }

      const response = await customerService.getProducts(filters)
      setProducts(response.data.items)
      setPagination(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (productId) => {
    onSelectProduct(productId)
    onNavigate("product-detail")
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    const params = Object.fromEntries(searchParams)
    params.page = page.toString()
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const ProductCard = ({ product }) => (
    <div
      onClick={() => handleProductClick(product.productId)}
      className="overflow-hidden transition-shadow bg-white rounded-lg shadow cursor-pointer hover:shadow-lg"
    >
      <div className="relative bg-gray-100 aspect-square">
        <img
          src={product.productImage || "/placeholder.svg"}
          alt={product.productName}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-3">
        <h3 className="mb-2 text-sm font-semibold text-gray-900 line-clamp-2">
          {product.productName}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.floor(product.averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"}
            />
          ))}
          <span className="ml-1 text-xs text-gray-600">
            ({product.reviewCount})
          </span>
        </div>

        <p className="text-lg font-bold text-blue-600">
          Rs. {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  )

  const ProductListItem = ({ product }) => (
    <div
      onClick={() => handleProductClick(product.productId)}
      className="flex gap-4 p-4 transition-shadow bg-white rounded-lg shadow cursor-pointer hover:shadow-lg"
    >
      <img
        src={product.productImage || "/placeholder.svg"}
        alt={product.productName}
        className="object-cover w-24 h-24 rounded-lg"
      />

      <div className="flex-1">
        <h3 className="mb-2 font-semibold text-gray-900">
          {product.productName}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(product.averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"}
            />
          ))}
          <span className="ml-1 text-sm text-gray-600">
            ({product.reviewCount})
          </span>
        </div>

        <p className="text-xl font-bold text-blue-600">
          Rs. {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    )
  }

  const handleClearSearch = () => {
    setSearchParams({})
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {searchParams.get("search") && (
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Back to Browse
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchParams.get("search") ? "Search Results" : "Browse Products"}
            </h1>
            {searchParams.get("search") && (
              <p className="mt-1 text-sm text-gray-600">
                Showing results for: "{searchParams.get("search")}"
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <Search size={64} className="mx-auto mb-4 text-gray-400" />
          <p className="mb-4 text-gray-600">No products found</p>
          {searchParams.get("search") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchParams({})
                setCurrentPage(1)
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductListItem key={product.productId} product={product} />
              ))}
            </div>
          )}

          {pagination?.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPrevious}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={18} />
              </Button>

              <span className="flex items-center px-4 text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}