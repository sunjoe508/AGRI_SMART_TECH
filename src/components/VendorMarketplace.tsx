
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star, Package, Truck } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  product_name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  stock_quantity: number;
  vendor: {
    name: string;
    rating: number;
    location: string;
  };
}

interface VendorMarketplaceProps {
  user: any;
}

const VendorMarketplace = ({ user }: VendorMarketplaceProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_products')
        .select(`
          id,
          product_name,
          category,
          price,
          unit,
          description,
          stock_quantity,
          vendors (
            name,
            rating,
            location
          )
        `)
        .gt('stock_quantity', 0);

      if (error) throw error;

      const formattedProducts = data.map(item => ({
        id: item.id,
        product_name: item.product_name,
        category: item.category,
        price: item.price,
        unit: item.unit,
        description: item.description,
        stock_quantity: item.stock_quantity,
        vendor: {
          name: item.vendors.name,
          rating: item.vendors.rating,
          location: item.vendors.location
        }
      }));

      setProducts(formattedProducts);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast({
      title: "✅ Added to Cart",
      description: "Product added successfully",
    });
  };

  const placeOrder = async (product: Product) => {
    try {
      const quantity = cart[product.id] || 1;
      const totalAmount = product.price * quantity;

      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          vendor_id: (await supabase.from('vendors').select('id').eq('name', product.vendor.name).single()).data?.id,
          product_id: product.id,
          quantity: quantity,
          total_amount: totalAmount,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "✅ Order Placed",
        description: `Order for ${product.product_name} placed successfully`,
      });

      // Remove from cart
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[product.id];
        return newCart;
      });
    } catch (error: any) {
      toast({
        title: "❌ Order Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading marketplace...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <span>Vendor Marketplace</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="seeds">Seeds</SelectItem>
                <SelectItem value="fertilizer">Fertilizers</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-2 hover:border-green-300 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.product_name}</CardTitle>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{product.vendor.rating}</span>
                    <span className="text-sm text-gray-500">• {product.vendor.name}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-bold text-green-600">KSh {product.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">per {product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                      <p className="text-sm text-gray-500">{product.vendor.location}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => addToCart(product.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Add to Cart {cart[product.id] ? `(${cart[product.id]})` : ''}
                    </Button>
                    <Button
                      onClick={() => placeOrder(product)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Order Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorMarketplace;
