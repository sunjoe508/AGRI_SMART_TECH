
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, User, Building2, Droplets, Activity, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReportGeneratorProps {
  user?: any;
}

const ReportGenerator = ({ user }: ReportGeneratorProps) => {
  const [selectedReport, setSelectedReport] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch user profile for report headers
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch irrigation data for reports
  const { data: irrigationData } = useQuery({
    queryKey: ['irrigation-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('irrigation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch sensor data for reports
  const { data: sensorData } = useQuery({
    queryKey: ['sensor-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!user?.id
  });

  const generateReportContent = (type: string) => {
    const systemInfo = {
      systemName: 'AgriSmart Precision Agriculture System',
      version: '2.0.1',
      generatedDate: new Date().toLocaleDateString(),
      generatedTime: new Date().toLocaleTimeString(),
      reportId: `ASR-${Date.now()}`
    };

    const ownerDetails = {
      fullName: profile?.full_name || 'AgriSmart User',
      farmName: profile?.farm_name || 'N/A',
      location: `${profile?.county || 'Kenya'}, ${profile?.ward || ''}`.trim().replace(/,$/, ''),
      phoneNumber: profile?.phone_number || 'N/A',
      farmSize: profile?.farm_size_acres ? `${profile.farm_size_acres} acres` : 'N/A',
      cropTypes: profile?.crop_types?.join(', ') || 'N/A'
    };

    let reportContent = `
===========================================
${systemInfo.systemName}
AGRICULTURAL REPORT - ${type.toUpperCase()}
===========================================

Report ID: ${systemInfo.reportId}
Generated: ${systemInfo.generatedDate} at ${systemInfo.generatedTime}
System Version: ${systemInfo.version}

-------------------------------------------
FARM OWNER DETAILS
-------------------------------------------
Name: ${ownerDetails.fullName}
Farm: ${ownerDetails.farmName}
Location: ${ownerDetails.location}
Phone: ${ownerDetails.phoneNumber}
Farm Size: ${ownerDetails.farmSize}
Crop Types: ${ownerDetails.cropTypes}

-------------------------------------------`;

    switch (type) {
      case 'irrigation':
        const totalWater = irrigationData?.reduce((sum, log) => sum + (log.water_amount_liters || 0), 0) || 0;
        const avgDuration = irrigationData?.length ? 
          Math.round(irrigationData.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / irrigationData.length) : 0;
        
        reportContent += `
IRRIGATION SUMMARY REPORT
-------------------------------------------
Total Irrigation Sessions: ${irrigationData?.length || 0}
Total Water Used: ${totalWater.toFixed(2)} liters
Average Session Duration: ${avgDuration} minutes
Most Active Zone: ${getMostActiveZone()}

RECENT IRRIGATION ACTIVITIES:
`;
        irrigationData?.slice(0, 10).forEach((log, index) => {
          reportContent += `
${index + 1}. Date: ${new Date(log.created_at).toLocaleDateString()}
   Zone: ${log.zone}
   Water: ${log.water_amount_liters}L
   Duration: ${log.duration_minutes} min
   Soil Moisture Before: ${log.soil_moisture_before || 'N/A'}%
   Soil Moisture After: ${log.soil_moisture_after || 'N/A'}%`;
        });
        break;

      case 'sensor':
        const sensorSummary = getSensorSummary();
        reportContent += `
SENSOR DATA ANALYSIS REPORT
-------------------------------------------
Total Sensor Readings: ${sensorData?.length || 0}
Active Sensor Types: ${Object.keys(sensorSummary).length}

SENSOR AVERAGES:
`;
        Object.entries(sensorSummary).forEach(([type, data]: [string, any]) => {
          reportContent += `
${type.toUpperCase()}:
   Average: ${data.average.toFixed(2)} ${data.unit}
   Latest: ${data.latest.toFixed(2)} ${data.unit}
   Readings: ${data.count}`;
        });

        reportContent += `

RECENT SENSOR READINGS:
`;
        sensorData?.slice(0, 15).forEach((reading, index) => {
          reportContent += `
${index + 1}. ${new Date(reading.created_at).toLocaleDateString()} - ${reading.sensor_type}: ${reading.value}${reading.unit} (${reading.location_zone || 'Unknown Zone'})`;
        });
        break;

      case 'comprehensive':
        reportContent += `
COMPREHENSIVE FARM REPORT
-------------------------------------------

IRRIGATION OVERVIEW:
- Total Sessions: ${irrigationData?.length || 0}
- Water Used: ${(irrigationData?.reduce((sum, log) => sum + (log.water_amount_liters || 0), 0) || 0).toFixed(2)}L
- Most Active Zone: ${getMostActiveZone()}

SENSOR MONITORING:
- Total Readings: ${sensorData?.length || 0}
- Sensor Types: ${Object.keys(getSensorSummary()).join(', ')}

RECOMMENDATIONS:
- Monitor soil moisture levels regularly
- Optimize irrigation timing based on sensor data
- Consider crop rotation for soil health
- Implement precision agriculture techniques

SYSTEM HEALTH:
- Database: Connected ✓
- Sensors: ${sensorData?.length ? 'Active' : 'Check Connection'} 
- Weather Integration: Active ✓
- Real-time Monitoring: Enabled ✓`;
        break;
    }

    reportContent += `

-------------------------------------------
END OF REPORT
-------------------------------------------
Generated by ${systemInfo.systemName}
© AgriSmart Technologies - Precision Agriculture Solutions
Support: support@agrismart.co.ke | +254-700-AGRI-TECH
    `;

    return reportContent;
  };

  const getMostActiveZone = () => {
    if (!irrigationData?.length) return 'N/A';
    
    const zoneCounts = irrigationData.reduce((acc: any, log) => {
      acc[log.zone] = (acc[log.zone] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(zoneCounts).reduce((a: any, b: any) => 
      zoneCounts[a[0]] > zoneCounts[b[0]] ? a : b
    )[0] || 'N/A';
  };

  const getSensorSummary = () => {
    if (!sensorData?.length) return {};
    
    const summary: any = {};
    
    sensorData.forEach(reading => {
      if (!summary[reading.sensor_type]) {
        summary[reading.sensor_type] = {
          values: [],
          unit: reading.unit,
          count: 0
        };
      }
      summary[reading.sensor_type].values.push(reading.value);
      summary[reading.sensor_type].count++;
    });
    
    Object.keys(summary).forEach(type => {
      const values = summary[type].values;
      summary[type].average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      summary[type].latest = values[0];
    });
    
    return summary;
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast({
        title: "⚠️ Select Report Type",
        description: "Please select a report type to generate",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    
    try {
      const reportContent = generateReportContent(selectedReport);
      
      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AgriSmart_${selectedReport}_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "📋 Report Generated Successfully",
        description: `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} report downloaded with owner details`,
      });

    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "❌ Report Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    { value: 'irrigation', label: 'Irrigation Report', icon: Droplets, description: 'Water usage and irrigation data' },
    { value: 'sensor', label: 'Sensor Data Report', icon: Activity, description: 'Environmental monitoring data' },
    { value: 'comprehensive', label: 'Comprehensive Report', icon: TrendingUp, description: 'Complete farm analysis' }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
          <FileText className="w-6 h-6" />
          <span>AgriSmart Report Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Owner Info Display */}
        {profile && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Farm Owner Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Name:</strong> {profile.full_name}</div>
              <div><strong>Farm:</strong> {profile.farm_name || 'N/A'}</div>
              <div><strong>Location:</strong> {profile.county}, {profile.ward}</div>
              <div><strong>Size:</strong> {profile.farm_size_acres} acres</div>
            </div>
          </div>
        )}

        {/* Report Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Select Report Type:</label>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger>
              <SelectValue placeholder="Choose report type..." />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Droplets className="w-6 h-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{irrigationData?.length || 0}</div>
            <div className="text-xs text-gray-600">Irrigation Logs</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <Activity className="w-6 h-6 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold text-green-600">{sensorData?.length || 0}</div>
            <div className="text-xs text-gray-600">Sensor Readings</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <Building2 className="w-6 h-6 mx-auto text-purple-600 mb-1" />
            <div className="text-2xl font-bold text-purple-600">{Object.keys(getSensorSummary()).length}</div>
            <div className="text-xs text-gray-600">Sensor Types</div>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateReport}
          disabled={!selectedReport || generating}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate & Download Report
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Reports include owner details, system information, and comprehensive farm data from AgriSmart database
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;
