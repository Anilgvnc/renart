import { useState, useEffect } from 'react'
import renartLogo from './assets/renart-logo.png'
import { FaStar, FaStarHalfAlt, FaRegStar, FaFilter } from 'react-icons/fa'
import './App.css'
import { Product, fetchProducts } from './util/products';
import { CircularProgress } from '@mui/material';

type GoldColor = "yellow" | "white" | "rose";

const colorMap: Record<GoldColor, { label: string; hex: string }> = {
  yellow: { label: "Yellow Gold", hex: "#f3c86a" },
  white: { label: "White Gold", hex: "#d3d3d3" },
  rose: { label: "Rose Gold", hex: "#eebac2" },
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<GoldColor>("yellow");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting to fetch products...");
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        console.log("Fetched products:", data);
        setProducts(data);
      } catch (err) {
        console.error("Product data cannot fetched: ", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (product.price === null || isNaN(product.price)) return false;

    const priceMatch =
      (minPrice === null || product.price >= minPrice) &&
      (maxPrice === null || product.price <= maxPrice);

    return nameMatch && priceMatch;
  });

  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (score >= i) stars.push(<FaStar key={i} color="gold" />);
      else if (score >= i - 0.5) stars.push(<FaStarHalfAlt key={i} color="gold" />);
      else stars.push(<FaRegStar key={i} color="gold" />);
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  return (
    <>
      <div id='header' className='header'>
        <a href="#header" target="_blank">
          <img src={renartLogo} className="logo" alt="Renart logo" />
        </a>
        <h1 className='title'>Product List</h1>
        <div className='filters'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='filter-button'
          >
            <FaFilter />
          </button>
          {showFilters && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="İsme göre ara"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  minWidth: "200px",
                }}
              />

              <input
                type="number"
                placeholder="Min fiyat"
                onChange={(e) =>
                  setMinPrice(e.target.value ? parseFloat(e.target.value) : null)
                }
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "100px",
                }}
              />

              <input
                type="number"
                placeholder="Max fiyat"
                onChange={(e) =>
                  setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)
                }
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "100px",
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div id='products' className='products-slider'>
        {loading &&
          <div className='loading'>
            <p>Loading products</p>
            <CircularProgress style={{ color: 'gold' }} />
          </div>
        }
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {!loading && !error && products.length === 0 && <div>No products found</div>}

        {filteredProducts.length === 0 && <p className='product-name'>No suitable product found</p>}
        {filteredProducts.map((product, index) => (
          <div key={index} className='product-card'>
            <img
              src={product.images[selectedColor]}
              alt={product.name}
              className='product-image'
            />
            <h3 className='product-name'>{product.name}</h3>
            <p className='product-price'>{product.price !== null ? `$${product.price.toFixed(2)}` : "Fiyat Yok"}</p>

            <div style={{ display: "flex", gap: "8px", margin: "8px 0" }}>
              {(["yellow", "white", "rose"] as GoldColor[]).map((color) => (
                <span
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: colorMap[color].hex,
                    border: selectedColor === color ? "2px solid black" : "1px solid #ccc",
                    cursor: "pointer"
                  }}
                />
              ))}
            </div>

            <p className='product-color-label'>{colorMap[selectedColor].label}</p>

            <div className='product-popularity'>
              {renderStars(product.popularityScore)}
              <span className='popularity-label'>{product.popularityScore.toFixed(2)}/5</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
