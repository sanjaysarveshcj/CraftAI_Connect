import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { OrderRequestData } from '@/services';

interface OrderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: OrderRequestData) => void;
  artisanName: string;
  availableProducts?: any[];
}

export function OrderRequestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  artisanName,
  availableProducts = []
}: OrderRequestModalProps) {
  const [formData, setFormData] = useState<OrderRequestData>({
    productId: '',
    quantity: 1,
    customization: '',
    specifications: '',
    requestedPrice: {
      min: 0,
      max: 0
    },
    timeline: ''
  });
  const [message, setMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderType, setOrderType] = useState<'existing' | 'custom'>('custom');

  const handleProductSelect = (productId: string) => {
    const product = availableProducts.find(p => p._id === productId);
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      productId,
      requestedPrice: {
        min: product?.price || 0,
        max: product?.price ? product.price * 1.2 : 0
      }
    }));
  };

  const handleSubmit = () => {
    if (!formData.productId && orderType !== 'custom') return;
    
    onSubmit({
      ...formData,
      message
    });
    
    // Reset form
    setFormData({
      productId: '',
      quantity: 1,
      customization: '',
      specifications: '',
      requestedPrice: { min: 0, max: 0 },
      timeline: ''
    });
    setMessage('');
    setSelectedProduct(null);
    setOrderType('custom');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Place Order with {artisanName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Type Selection */}
          <div className="space-y-2">
            <Label>Order Type</Label>
            <Select
              value={orderType}
              onValueChange={(value) => setOrderType(value as 'existing' | 'custom')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">Existing Product</SelectItem>
                <SelectItem value="custom">Custom Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection (for existing products) */}
          {orderType === 'existing' && (
            <div className="space-y-2">
              <Label>Select Product</Label>
              {availableProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
                  {availableProducts.map((product) => (
                    <Card 
                      key={product._id} 
                      className={`cursor-pointer transition-colors ${
                        formData.productId === product._id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleProductSelect(product._id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.description}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary">{product.category}</Badge>
                              <span className="ml-2 font-medium">${product.price}</span>
                            </div>
                          </div>
                          {product.images && product.images.length > 0 && (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No products available from this artisan
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            />
          </div>

          {/* Customization Details */}
          <div className="space-y-2">
            <Label htmlFor="customization">
              {orderType === 'custom' ? 'Product Description' : 'Customization Requests'}
            </Label>
            <Textarea
              id="customization"
              placeholder={
                orderType === 'custom' 
                  ? "Describe what you want created..." 
                  : "Any special requests or modifications..."
              }
              value={formData.customization}
              onChange={(e) => setFormData(prev => ({ ...prev, customization: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Preferred Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Preferred Timeline</Label>
            <Select
              value={formData.timeline || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3 days">1-3 days</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
                <SelectItem value="2 weeks">2 weeks</SelectItem>
                <SelectItem value="1 month">1 month</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minPrice" className="text-sm">Minimum ($)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  min="0"
                  value={formData.requestedPrice?.min || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requestedPrice: { ...prev.requestedPrice!, min: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-sm">Maximum ($)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min="0"
                  value={formData.requestedPrice?.max || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requestedPrice: { ...prev.requestedPrice!, max: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              placeholder="Any additional details or questions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Order Summary */}
          {(selectedProduct || orderType === 'custom') && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Order Summary
                </h4>
                <div className="space-y-1 text-sm">
                  {selectedProduct && (
                    <p><span className="font-medium">Product:</span> {selectedProduct.name}</p>
                  )}
                  <p><span className="font-medium">Quantity:</span> {formData.quantity}</p>
                  <p><span className="font-medium">Timeline:</span> {formData.timeline || 'Not specified'}</p>
                  <p><span className="font-medium">Budget:</span> ${formData.requestedPrice?.min || 0} - ${formData.requestedPrice?.max || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                (orderType === 'existing' && !formData.productId) ||
                (formData.requestedPrice?.min || 0) <= 0
              }
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Order Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OrderRequestModal;