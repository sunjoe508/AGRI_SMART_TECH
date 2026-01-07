import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, User, Building2, Droplets, Activity, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import agriSmartLogo from '@/assets/agrismart-logo.png';

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

  const generatePDFReport = (type: string) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header Design
      pdf.setFillColor(34, 197, 94); // Green header
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Add professional logo
      try {
        const img = new Image();
        img.src = agriSmartLogo;
        pdf.addImage(img, 'PNG', 10, 8, 24, 24);
      } catch (error) {
        // Fallback to text logo if image fails
        pdf.setFillColor(255, 255, 255);
        pdf.circle(20, 20, 8, 'F');
      }
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AgriSmart', 35, 20);
      pdf.setFontSize(12);
      pdf.text('Precision Agriculture System', 35, 28);
      
      // Report type badge
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(pageWidth - 80, 10, 70, 20, 5, 5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(type.toUpperCase() + ' REPORT', pageWidth - 75, 22);
      
      yPosition = 60;

      // Report Info Section with stable data handling
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const reportInfo: [string, string][] = [
        ['Report ID:', `ASR-${Date.now()}`],
        ['Generated:', new Date().toLocaleDateString()],
        ['Time:', new Date().toLocaleTimeString()],
        ['System Version:', '2.0.1']
      ];

      reportInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 70, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Farm Owner Section with null safety
      pdf.setFillColor(243, 244, 246);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 50, 'F');
      
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Farm Owner Details', 20, yPosition + 5);
      
      yPosition += 15;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      const ownerDetails: [string, string][] = [
        ['Name:', profile?.full_name || 'AgriSmart User'],
        ['Farm:', profile?.farm_name || 'N/A'],
        ['Location:', `${profile?.county || 'Kenya'}, ${profile?.ward || ''}`.trim().replace(/,$/, '')],
        ['Phone:', profile?.phone_number || 'N/A'],
        ['Farm Size:', profile?.farm_size_acres ? `${profile.farm_size_acres} acres` : 'N/A'],
        ['Crops:', profile?.crop_types?.join(', ') || 'N/A']
      ];

      ownerDetails.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 60, yPosition);
        yPosition += 8;
      });

      yPosition += 20;

      // Report Content Based on Type with stable data handling
      switch (type) {
        case 'irrigation':
          generateIrrigationContent(pdf, yPosition);
          break;
        case 'sensor':
          generateSensorContent(pdf, yPosition);
          break;
        case 'comprehensive':
          generateComprehensiveContent(pdf, yPosition);
          break;
      }

      // Footer
      const footerY = pageHeight - 30;
      pdf.setFillColor(75, 85, 99);
      pdf.rect(0, footerY, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text('© AgriSmart Technologies - Precision Agriculture Solutions', 20, footerY + 10);
      pdf.text('Support: support@agrismart.co.ke | +254-700-AGRI-TECH', 20, footerY + 18);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - 100, footerY + 10);

      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF report');
    }
  };

  const generateIrrigationContent = (pdf: jsPDF, startY: number) => {
    let yPos = startY;
    
    // Section Header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(15, yPos - 5, pdf.internal.pageSize.getWidth() - 30, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Irrigation Summary Report', 20, yPos + 7);
    
    yPos += 25;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);

    // Safe data calculations
    const totalWater = (irrigationData as any[])?.reduce((sum, log) => sum + (Number(log.water_used_liters) || 0), 0) || 0;
    const avgDuration = irrigationData?.length ? 
      Math.round(irrigationData.reduce((sum, log) => sum + (Number(log.duration_minutes) || 0), 0) / irrigationData.length) : 0;

    // Statistics boxes with safe data handling
    const stats: [string, string][] = [
      ['Total Sessions', String(irrigationData?.length || 0)],
      ['Total Water Used', `${totalWater.toFixed(2)}L`],
      ['Avg Duration', `${avgDuration} min`],
      ['Most Active Zone', getMostActiveZone()]
    ];

    stats.forEach(([label, value], index) => {
      const xPos = 20 + (index % 2) * 90;
      const boxY = yPos + Math.floor(index / 2) * 25;
      
      pdf.setFillColor(220, 252, 231);
      pdf.rect(xPos, boxY, 80, 20, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, xPos + 5, boxY + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, xPos + 5, boxY + 15);
    });

    yPos += 60;

    // Recent Activities with safe data handling
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Irrigation Activities:', 20, yPos);
    yPos += 10;

    const recentLogs = irrigationData?.slice(0, 5) || [];
    recentLogs.forEach((log, index) => {
      try {
        pdf.setFont('helvetica', 'normal');
        const dateText = `${index + 1}. ${new Date(log.created_at).toLocaleDateString()} - Zone: ${log.zone || 'N/A'}`;
        pdf.text(dateText, 25, yPos);
        yPos += 6;
        const detailText = `   Water: ${(log as any).water_used_liters || 0}L, Duration: ${log.duration_minutes || 0} min`;
        pdf.text(detailText, 25, yPos);
        yPos += 8;
      } catch (error) {
        console.error('Error rendering irrigation log:', error);
        pdf.text(`   Error rendering log ${index + 1}`, 25, yPos);
        yPos += 8;
      }
    });
  };

  const generateSensorContent = (pdf: jsPDF, startY: number) => {
    let yPos = startY;
    
    // Section Header
    pdf.setFillColor(16, 185, 129);
    pdf.rect(15, yPos - 5, pdf.internal.pageSize.getWidth() - 30, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sensor Data Analysis Report', 20, yPos + 7);
    
    yPos += 25;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);

    const sensorSummary = getSensorSummary();
    const sensorCount = sensorData?.length || 0;
    const sensorTypeCount = Object.keys(sensorSummary).length;

    // Sensor Overview with safe data handling
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Sensor Readings: ${sensorCount}`, 20, yPos);
    yPos += 8;
    pdf.text(`Active Sensor Types: ${sensorTypeCount}`, 20, yPos);
    yPos += 15;

    // Sensor Averages with error handling
    Object.entries(sensorSummary).forEach(([type, data]: [string, any]) => {
      try {
        pdf.setFillColor(243, 244, 246);
        pdf.rect(20, yPos - 3, 150, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(type.toUpperCase(), 25, yPos + 5);
        pdf.setFont('helvetica', 'normal');
        const avgText = `Avg: ${(data.average || 0).toFixed(2)}${data.unit || ''} | Latest: ${(data.latest || 0).toFixed(2)}${data.unit || ''}`;
        pdf.text(avgText, 25, yPos + 10);
        yPos += 20;
      } catch (error) {
        console.error('Error rendering sensor data:', error);
        pdf.text(`Error rendering ${type} data`, 25, yPos);
        yPos += 15;
      }
    });
  };

  const generateComprehensiveContent = (pdf: jsPDF, startY: number) => {
    let yPos = startY;
    
    // Multiple sections with different colors
    const sections = [
      { title: 'Irrigation Overview', color: [59, 130, 246] as [number, number, number] },
      { title: 'Sensor Monitoring', color: [16, 185, 129] as [number, number, number] },
      { title: 'Recommendations', color: [245, 158, 11] as [number, number, number] }
    ];

    sections.forEach((section) => {
      pdf.setFillColor(section.color[0], section.color[1], section.color[2]);
      pdf.rect(15, yPos - 5, pdf.internal.pageSize.getWidth() - 30, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, 20, yPos + 5);
      yPos += 20;
    });
  };

  const getMostActiveZone = (): string => {
    try {
      if (!irrigationData?.length) return 'N/A';
      
      const zoneCounts = irrigationData.reduce((acc: Record<string, number>, log) => {
        const zone = log.zone || 'Unknown';
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
      }, {});
      
      const entries = Object.entries(zoneCounts);
      if (entries.length === 0) return 'N/A';
      
      return entries.reduce((a, b) => zoneCounts[a[0]] > zoneCounts[b[0]] ? a : b)[0];
    } catch (error) {
      console.error('Error calculating most active zone:', error);
      return 'N/A';
    }
  };

  const getSensorSummary = () => {
    try {
      if (!sensorData?.length) return {};
      
      const summary: Record<string, any> = {};
      
      (sensorData as any[]).forEach((reading: any) => {
        const type = reading.sensor_id || 'sensor';
        if (!summary[type]) {
          summary[type] = {
            values: [],
            unit: '',
            count: 0
          };
        }
        const value = Number(reading.soil_moisture || reading.temperature || reading.humidity || 0);
        summary[type].values.push(value);
        summary[type].count++;
      });
      
      Object.keys(summary).forEach(type => {
        const values = summary[type].values;
        if (values.length > 0) {
          summary[type].average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
          summary[type].latest = values[0] || 0;
        } else {
          summary[type].average = 0;
          summary[type].latest = 0;
        }
      });
      
      return summary;
    } catch (error) {
      console.error('Error processing sensor summary:', error);
      return {};
    }
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
      const pdf = generatePDFReport(selectedReport);
      
      // Save the PDF with error handling
      const fileName = `AgriSmart_${selectedReport}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Record report generation in database for tracking
      await (supabase as any)
        .from('daily_reports')
        .insert({
          user_id: user?.id,
          report_date: new Date().toISOString().split('T')[0],
          irrigation_summary: selectedReport === 'irrigation' || selectedReport === 'comprehensive' ? 
            { total_sessions: irrigationData?.length || 0, total_water: (irrigationData as any[])?.reduce((sum, log) => sum + (Number(log.water_used_liters) || 0), 0) || 0 } : null,
          sensor_summary: selectedReport === 'sensor' || selectedReport === 'comprehensive' ? 
            { total_readings: sensorData?.length || 0, sensor_types: Object.keys(getSensorSummary()).length } : null,
          recommendations: ['Report generated successfully via PDF export']
        });

      toast({
        title: "📋 PDF Report Generated Successfully",
        description: `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} report downloaded as PDF`,
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "❌ Report Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
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
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300 text-base md:text-lg">
          <FileText className="w-5 h-5 md:w-6 md:h-6" />
          <span>PDF Report Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {/* Owner Info Display - Responsive */}
        {profile && (
          <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border">
            <h3 className="font-semibold mb-2 flex items-center space-x-2 text-sm md:text-base">
              <User className="w-4 h-4" />
              <span>Farm Owner</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm">
              <div className="truncate"><strong>Name:</strong> {profile.full_name}</div>
              <div className="truncate"><strong>Farm:</strong> {profile.farm_name || 'N/A'}</div>
              <div className="truncate"><strong>Location:</strong> {profile.county}, {profile.ward}</div>
              <div><strong>Size:</strong> {profile.farm_size_acres} acres</div>
            </div>
          </div>
        )}

        {/* Report Type Selection - Responsive */}
        <div className="space-y-2 md:space-y-3">
          <label className="text-xs md:text-sm font-medium">Select Report Type:</label>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Choose report type..." />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: 'irrigation', label: 'Irrigation Report', icon: Droplets, description: 'Water usage data' },
                { value: 'sensor', label: 'Sensor Data Report', icon: Activity, description: 'Monitoring data' },
                { value: 'comprehensive', label: 'Comprehensive Report', icon: TrendingUp, description: 'Full analysis' }
              ].map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500 truncate">{type.description}</div>
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
              Generating PDF Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate & Download PDF Report
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Reports are generated as professional PDF documents with aesthetic design and comprehensive farm data
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;
