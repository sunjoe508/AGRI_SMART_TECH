
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Star, Package, Truck, CreditCard } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PayPalCheckout from './PayPalCheckout';

interface Product {
  id: string;
  product_name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  stock_quantity: number;
  image_url?: string;
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
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
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
          image_url,
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
        image_url: item.image_url,
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
      filtered = filtered.filter(product => product.category.toLowerCase() === categoryFilter.toLowerCase());
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

  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (!checkoutProduct) return;

    try {
      const quantity = cart[checkoutProduct.id] || 1;
      const totalAmount = checkoutProduct.price * quantity;

      const vendorResponse = await supabase
        .from('vendors')
        .select('id')
        .eq('name', checkoutProduct.vendor.name)
        .single();

      if (vendorResponse.error) throw vendorResponse.error;

      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          vendor_id: vendorResponse.data.id,
          product_id: checkoutProduct.id,
          quantity: quantity,
          total_amount: totalAmount,
          status: 'confirmed',
          order_notes: `Paid via PayPal: ${paymentDetails.id}`
        });

      if (error) throw error;

      toast({
        title: "✅ Order Completed",
        description: `Order for ${checkoutProduct.product_name} placed and paid successfully`,
      });

      // Remove from cart
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[checkoutProduct.id];
        return newCart;
      });

      setCheckoutProduct(null);
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
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-2 border-green-200 dark:border-green-700">
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
                <SelectItem value="fertilizers">Fertilizers</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="pesticides">Pesticides</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-2 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                {product.image_url && (
                  <div className="aspect-square w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image_url} 
                      alt={product.product_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">KSh {product.price.toLocaleString()}</p>
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
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setCheckoutProduct(product)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Buy Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Complete Purchase</DialogTitle>
                        </DialogHeader>
                        {checkoutProduct && (
                          <PayPalCheckout
                            amount={checkoutProduct.price * (cart[checkoutProduct.id] || 1)}
                            onSuccess={handlePaymentSuccess}
                            onError={(error) => {
                              toast({
                                title: "❌ Payment Error",
                                description: "Payment processing failed",
                                variant: "destructive"
                              });
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
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
