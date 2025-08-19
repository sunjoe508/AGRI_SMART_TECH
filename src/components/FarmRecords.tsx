import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Calendar, 
  Wheat, 
  MapPin, 
  FileText, 
  Edit3, 
  Trash2,
  TrendingUp,
  Sprout,
  Bug,
  Scissors
} from 'lucide-react';
import { format } from 'date-fns';

interface FarmRecordsProps {
  user: any;
}

const FarmRecords = ({ user }: FarmRecordsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const [newRecord, setNewRecord] = useState({
    record_type: '',
    crop_type: '',
    area_size: '',
    quantity: '',
    unit: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0],
    location_zone: '',
    cost: ''
  });

  // Fetch farm records
  const { data: farmRecords, isLoading } = useQuery({
    queryKey: ['farm-records', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farm_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const recordTypes = [
    { value: 'planting', label: 'Planting', icon: Sprout },
    { value: 'harvesting', label: 'Harvesting', icon: Scissors },
    { value: 'fertilizing', label: 'Fertilizing', icon: TrendingUp },
    { value: 'pest_control', label: 'Pest Control', icon: Bug },
    { value: 'irrigation', label: 'Irrigation', icon: MapPin },
    { value: 'maintenance', label: 'Maintenance', icon: Edit3 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recordData = {
        ...newRecord,
        user_id: user.id,
        area_size: newRecord.area_size ? parseFloat(newRecord.area_size) : null,
        quantity: newRecord.quantity ? parseFloat(newRecord.quantity) : null,
        cost: newRecord.cost ? parseFloat(newRecord.cost) : 0,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('farm_records')
          .update(recordData)
          .eq('id', editingRecord.id);
        
        if (error) throw error;
        toast({
          title: "✅ Record Updated",
          description: "Farm record has been successfully updated",
        });
        setEditingRecord(null);
      } else {
        const { error } = await supabase
          .from('farm_records')
          .insert([recordData]);
        
        if (error) throw error;
        toast({
          title: "✅ Record Added",
          description: "New farm record has been successfully created",
        });
      }

      // Reset form
      setNewRecord({
        record_type: '',
        crop_type: '',
        area_size: '',
        quantity: '',
        unit: '',
        notes: '',
        record_date: new Date().toISOString().split('T')[0],
        location_zone: '',
        cost: ''
      });
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ['farm-records'] });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save record",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (record: any) => {
    setNewRecord({
      record_type: record.record_type,
      crop_type: record.crop_type || '',
      area_size: record.area_size?.toString() || '',
      quantity: record.quantity?.toString() || '',
      unit: record.unit || '',
      notes: record.notes || '',
      record_date: record.record_date,
      location_zone: record.location_zone || '',
      cost: record.cost?.toString() || ''
    });
    setEditingRecord(record);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('farm_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "✅ Record Deleted",
        description: "Farm record has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['farm-records'] });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const getRecordTypeIcon = (type: string) => {
    const recordType = recordTypes.find(rt => rt.value === type);
    return recordType?.icon || FileText;
  };

  const getRecordTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      planting: 'bg-green-100 text-green-800',
      harvesting: 'bg-orange-100 text-orange-800',
      fertilizing: 'bg-blue-100 text-blue-800',
      pest_control: 'bg-red-100 text-red-800',
      irrigation: 'bg-cyan-100 text-cyan-800',
      maintenance: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Farm Records</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your farm activities and maintain detailed records</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{editingRecord ? 'Edit Record' : 'Add New Record'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="record_type">Activity Type *</Label>
                  <Select value={newRecord.record_type} onValueChange={(value) => setNewRecord({...newRecord, record_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="crop_type">Crop Type</Label>
                  <Input
                    id="crop_type"
                    value={newRecord.crop_type}
                    onChange={(e) => setNewRecord({...newRecord, crop_type: e.target.value})}
                    placeholder="e.g., Maize, Beans, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="record_date">Date *</Label>
                  <Input
                    id="record_date"
                    type="date"
                    value={newRecord.record_date}
                    onChange={(e) => setNewRecord({...newRecord, record_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="area_size">Area Size (acres)</Label>
                  <Input
                    id="area_size"
                    type="number"
                    step="0.1"
                    value={newRecord.area_size}
                    onChange={(e) => setNewRecord({...newRecord, area_size: e.target.value})}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={newRecord.quantity}
                    onChange={(e) => setNewRecord({...newRecord, quantity: e.target.value})}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newRecord.unit}
                    onChange={(e) => setNewRecord({...newRecord, unit: e.target.value})}
                    placeholder="kg, bags, liters, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="location_zone">Location/Zone</Label>
                  <Input
                    id="location_zone"
                    value={newRecord.location_zone}
                    onChange={(e) => setNewRecord({...newRecord, location_zone: e.target.value})}
                    placeholder="Field A, Zone 1, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Cost (KES)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newRecord.cost}
                    onChange={(e) => setNewRecord({...newRecord, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  placeholder="Additional details about this activity..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingRecord(null);
                    setNewRecord({
                      record_type: '',
                      crop_type: '',
                      area_size: '',
                      quantity: '',
                      unit: '',
                      notes: '',
                      record_date: new Date().toISOString().split('T')[0],
                      location_zone: '',
                      cost: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : farmRecords && farmRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmRecords.map((record: any) => {
                    const IconComponent = getRecordTypeIcon(record.record_type);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" />
                            <Badge className={getRecordTypeBadgeColor(record.record_type)}>
                              {recordTypes.find(rt => rt.value === record.record_type)?.label || record.record_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(record.record_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.crop_type || '-'}</TableCell>
                        <TableCell>
                          {record.area_size ? `${record.area_size} acres` : '-'}
                        </TableCell>
                        <TableCell>
                          {record.quantity && record.unit ? `${record.quantity} ${record.unit}` : 
                           record.quantity ? record.quantity : '-'}
                        </TableCell>
                        <TableCell>
                          {record.cost > 0 ? `KES ${record.cost.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>{record.location_zone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEdit(record)}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wheat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No farm records yet. Start by adding your first activity!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmRecords;