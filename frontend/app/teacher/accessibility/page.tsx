'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout-new';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Accessibility,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Video,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

interface Material {
  id: number;
  name: string;
  type: 'video' | 'document' | 'image';
  course: string;
  uploadDate: string;
  accessibilityScore: number;
  issues: {
    critical: number;
    warning: number;
    passed: number;
  };
}

export default function TeacherAccessibilityPage() {
  useCommonShortcuts('teacher');
  
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: 1,
      name: 'Introduction to HTML.mp4',
      type: 'video',
      course: 'Web Development',
      uploadDate: '2024-03-01',
      accessibilityScore: 85,
      issues: { critical: 0, warning: 2, passed: 8 }
    },
    {
      id: 2,
      name: 'CSS Basics Slides.pdf',
      type: 'document',
      course: 'Web Development',
      uploadDate: '2024-03-05',
      accessibilityScore: 65,
      issues: { critical: 1, warning: 3, passed: 6 }
    },
    {
      id: 3,
      name: 'JavaScript Tutorial.mp4',
      type: 'video',
      course: 'Web Development',
      uploadDate: '2024-03-08',
      accessibilityScore: 95,
      issues: { critical: 0, warning: 0, passed: 10 }
    },
    {
      id: 4,
      name: 'Algorithm Diagram.png',
      type: 'image',
      course: 'Data Structures',
      uploadDate: '2024-03-10',
      accessibilityScore: 40,
      issues: { critical: 2, warning: 1, passed: 3 }
    },
  ]);

  const [isScanning, setIsScanning] = useState(false);

  const handleRescan = async (materialId: number) => {
    setIsScanning(true);
    console.log('Rescanning material:', materialId);
    // TODO: API call to rescan material
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsScanning(false);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-green-600">Excellent</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-yellow-600">Good</Badge>;
    } else {
      return <Badge className="bg-red-600">Needs Improvement</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" aria-hidden="true" />;
      case 'document':
        return <FileText className="h-4 w-4" aria-hidden="true" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
      default:
        return <FileText className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const averageScore = Math.round(
    materials.reduce((sum, m) => sum + m.accessibilityScore, 0) / materials.length
  );

  return (
    <DashboardLayout role="teacher" userName="Dr. Sarah Johnson" userRole="Teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accessibility Checker</h1>
          <p className="text-gray-600 mt-1">Review accessibility scores for your course materials</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Accessibility className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fully Accessible</p>
                  <p className="text-2xl font-bold">
                    {materials.filter(m => m.accessibilityScore >= 80).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Needs Review</p>
                  <p className="text-2xl font-bold">
                    {materials.filter(m => m.accessibilityScore >= 60 && m.accessibilityScore < 80).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold">
                    {materials.filter(m => m.accessibilityScore < 60).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Course Materials Accessibility Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(material.type)}
                        {material.name}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{material.type}</TableCell>
                    <TableCell>{material.course}</TableCell>
                    <TableCell>{material.uploadDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${
                              material.accessibilityScore >= 80 
                                ? 'bg-green-600' 
                                : material.accessibilityScore >= 60 
                                ? 'bg-yellow-600' 
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${material.accessibilityScore}%` }}
                            role="progressbar"
                            aria-valuenow={material.accessibilityScore}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${material.accessibilityScore}% accessibility score`}
                          />
                        </div>
                        <span className="text-sm font-medium">{material.accessibilityScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {material.issues.critical > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {material.issues.critical} Critical
                          </Badge>
                        )}
                        {material.issues.warning > 0 && (
                          <Badge className="bg-yellow-600 text-xs">
                            {material.issues.warning} Warning
                          </Badge>
                        )}
                        {material.issues.critical === 0 && material.issues.warning === 0 && (
                          <Badge className="bg-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                            All Passed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRescan(material.id)}
                          disabled={isScanning}
                        >
                          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} aria-hidden="true" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => console.log('View details:', material.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Accessibility Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Accessibility Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-blue-900">Videos</p>
                <p className="text-sm text-blue-800">
                  Include captions, transcripts, and audio descriptions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-blue-900">Documents</p>
                <p className="text-sm text-blue-800">
                  Use proper heading structure, alt text for images, and readable fonts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-blue-900">Images</p>
                <p className="text-sm text-blue-800">
                  Provide descriptive alt text and avoid text-heavy images
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
