import { useState, useEffect } from 'react';
import { Users, Truck, Clock, Wrench, Package, RotateCcw, Move, Lock, Unlock, Key, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Technician {
  id: string;
  name: string;
  notes?: string;
}

interface Foreman {
  id: string;
  name: string;
  technicians: Technician[];
}

interface Department {
  foremen: Foreman[];
}

interface Assignments {
  [departmentName: string]: Department;
}

interface DraggedItem {
  technician: Technician;
  foremanIndex: number;
}

const TechnicianAssignmentTool = () => {
  const [assignments, setAssignments] = useState<Assignments>({});
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load assignments from backend
  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
        setLastUpdated(new Date());
        setIsOnline(true);
      } else {
        throw new Error('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAssignments();
    
    // Auto-refresh every 30 seconds to sync with other users
    const interval = setInterval(loadAssignments, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePinSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/api/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsLocked(false);
        setShowPinModal(false);
        setPinInput('');
        setPinError(false);
      } else {
        setPinError(true);
        setPinInput('');
        setTimeout(() => setPinError(false), 2000);
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      setPinError(true);
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setDraggedItem(null);
    setDraggedFrom(null);
  };

  const handleDragStart = (e: React.DragEvent, technician: Technician, departmentName: string, foremanIndex: number) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    setDraggedItem({ technician, foremanIndex });
    setDraggedFrom(departmentName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDepartment: string, targetForemanIndex: number) => {
    e.preventDefault();
    
    if (isLocked || !draggedItem || !draggedFrom) {
      return;
    }

    const targetForeman = assignments[targetDepartment]?.foremen[targetForemanIndex];
    if (!targetForeman) return;

    // Don't allow drop on same location
    if (targetDepartment === draggedFrom && targetForemanIndex === draggedItem.foremanIndex) {
      setDraggedItem(null);
      setDraggedFrom(null);
      return;
    }

    try {
      setSaving(true);
      
        // Save to backend
        const response = await fetch(`${API_URL}/api/move-technician`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            technicianId: draggedItem.technician.id,
            newDepartment: targetDepartment,
            newForemanName: targetForeman.name,
            newForemanId: targetForeman.id
          })
        });

        if (response.ok) {
          // Update local state immediately for better UX
          setAssignments(prev => {
            const newAssignments = { ...prev };
            
            // Remove from source
            newAssignments[draggedFrom].foremen[draggedItem.foremanIndex].technicians = 
              newAssignments[draggedFrom].foremen[draggedItem.foremanIndex].technicians.filter(
                (tech: Technician) => tech.id !== draggedItem.technician.id
              );
            
            // Add to target
            newAssignments[targetDepartment].foremen[targetForemanIndex].technicians.push(
              draggedItem.technician
            );
            
            return newAssignments;
          });        setIsOnline(true);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to save assignment');
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      setIsOnline(false);
      // Reload to get current state
      loadAssignments();
    } finally {
      setSaving(false);
      setDraggedItem(null);
      setDraggedFrom(null);
    }
  };

  const getDepartmentIcon = (departmentName: string) => {
    if (departmentName.includes('Field')) return <Truck className="w-5 h-5" />;
    if (departmentName.includes('Body')) return <Wrench className="w-5 h-5" />;
    if (departmentName.includes('PacLease')) return <Package className="w-5 h-5" />;
    if (departmentName.includes('Recon')) return <RotateCcw className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getTotalTechnicians = (department: Department) => {
    return department.foremen?.reduce((total: number, foreman: Foreman) => total + foreman.technicians.length, 0) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-red-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading Kenworth assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-red-700 text-white p-6 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">KENWORTH</h1>
                <p className="text-red-200">Technician Assignment Manager</p>
              </div>
            </div>
            
            {/* Status and Controls */}
            <div className="flex items-center gap-3">
              {/* Online Status */}
              <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${isOnline ? 'bg-green-600' : 'bg-red-800'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
              
              {/* Lock Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded ${isLocked ? 'bg-red-600' : 'bg-green-600'}`}>
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isLocked ? 'LOCKED' : 'UNLOCKED'}
                </span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={loadAssignments}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Sync
              </button>
              
              {/* Lock/Unlock Button */}
              {isLocked ? (
                <button
                  onClick={() => setShowPinModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Unlock
                </button>
              ) : (
                <button
                  onClick={handleLock}
                  className="bg-red-600 hover:bg-red-800 px-4 py-2 rounded flex items-center gap-2 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Lock
                </button>
              )}
            </div>
          </div>
          
          {/* Last Updated */}
          {lastUpdated && (
            <div className="mt-2 text-red-200 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {saving && <span className="ml-2 text-yellow-300">Saving...</span>}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Object.entries(assignments).map(([departmentName, departmentData]) => (
              <div key={departmentName} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                {/* Department Header */}
                <div className="bg-red-700 text-white p-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDepartmentIcon(departmentName)}
                      <h2 className="text-xl font-bold">{departmentName}</h2>
                    </div>
                    <div className="bg-red-600 px-2 py-1 rounded text-sm">
                      {getTotalTechnicians(departmentData)} Total Techs
                    </div>
                  </div>
                </div>

                {/* Foremen and their teams */}
                <div className="space-y-4">
                  {(departmentData as any).foremen?.map((foreman: any, foremanIndex: number) => (
                    <div key={foremanIndex} className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                      {/* Foreman Header */}
                      <div className="bg-yellow-500 text-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">
                              {foreman.name}
                              {foreman.id && (
                                <span className="text-yellow-200 text-sm ml-2">
                                  #{foreman.id}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="bg-yellow-600 px-2 py-1 rounded text-xs">
                            {foreman.technicians.length} Techs
                          </div>
                        </div>
                      </div>

                      {/* Technicians under this foreman */}
                      <div 
                        className="p-3 min-h-20"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, departmentName, foremanIndex)}
                      >
                        {foreman.technicians.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {foreman.technicians.map((technician: any) => (
                              <div
                                key={technician.id}
                                className={`bg-gray-100 border border-gray-300 p-2 rounded transition-all ${
                                  isLocked 
                                    ? 'cursor-not-allowed opacity-75' 
                                    : 'cursor-move hover:shadow-md hover:bg-gray-200'
                                }`}
                                draggable={!isLocked}
                                onDragStart={(e) => handleDragStart(e, technician, departmentName, foremanIndex)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800 text-sm truncate">
                                      {technician.name}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      #{technician.id}
                                      {technician.notes && (
                                        <span className="ml-1 bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                          {technician.notes}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isLocked ? (
                                    <Lock className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                  ) : (
                                    <Move className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 p-4 rounded text-center text-gray-500 text-sm">
                            Drop technicians here
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Instructions</h3>
            <p className="text-red-700 mb-2">
              <strong>Database Sync:</strong> Changes are automatically saved to the database and shared with all users. 
              The system syncs every 30 seconds or click "Sync" for immediate updates.
            </p>
            <p className="text-red-700 mb-2">
              <strong>Security:</strong> Click "Unlock" and enter PIN 1971 to enable editing.
            </p>
            <p className="text-red-700">
              <strong>Editing:</strong> When unlocked, drag and drop technicians between foremen. 
              Changes are saved immediately and visible to all users.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Object.entries(assignments).map(([departmentName, departmentData]) => (
              <div key={departmentName} className="bg-gray-800 text-white p-4 rounded-lg">
                <h4 className="font-semibold text-sm">{departmentName}</h4>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-red-400">
                    {getTotalTechnicians(departmentData)}
                  </div>
                  <div className="text-xs text-gray-300">
                    Technicians | {(departmentData as any).foremen?.length || 0} Foremen
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pin Entry Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-6 h-6 text-red-700" />
                <h3 className="text-xl font-bold text-gray-800">Enter PIN to Unlock</h3>
              </div>
              
              <div className="mb-4">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
                  className={`w-full p-3 border-2 rounded text-center text-lg tracking-widest ${
                    pinError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter PIN"
                  maxLength={4}
                  autoFocus
                />
                {pinError && (
                  <p className="text-red-600 text-sm mt-2 text-center">
                    Incorrect PIN. Please try again.
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  className="flex-1 bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded transition-colors"
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianAssignmentTool;