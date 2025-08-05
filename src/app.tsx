import { useState } from 'react';
import { Users, Truck, Clock, Wrench, Package, RotateCcw, Move, Lock, Unlock, Key } from 'lucide-react';

const TechnicianAssignmentTool = () => {
  // Updated data structure with foremen and their assigned technicians
  const [assignments, setAssignments] = useState({
    "1st Shift": {
      foremen: [
        {
          name: "Shane Doty",
          id: "186",
          technicians: [
            { name: "Phil Cummins", id: "101", notes: "" },
            { name: "Laryssa Jones", id: "159", notes: "" },
            { name: "Tim Kelley", id: "173", notes: "" },
            { name: "Luke Border", id: "751", notes: "" },
            { name: "Noah Ryan", id: "156", notes: "" },
            { name: "Trent Weatherington", id: "735", notes: "ND" }
          ]
        },
        {
          name: "Tyler Merriman",
          id: "782",
          technicians: [
            { name: "Benjamin Cooke", id: "140", notes: "ND" },
            { name: "Devin Stilwell", id: "195", notes: "" },
            { name: "Bailey Hughes", id: "180", notes: "" },
            { name: "Donny Bell", id: "125", notes: "" }
          ]
        },
        {
          name: "Dustin Russell",
          id: "780",
          technicians: [
            { name: "Will Parrish", id: "168", notes: "" },
            { name: "Kyler Moody", id: "706", notes: "" },
            { name: "Remington Nold", id: "754", notes: "ND" },
            { name: "Manny Ponce", id: "272", notes: "" },
            { name: "Shawn Schmidt", id: "103", notes: "" }
          ]
        }
      ]
    },
    "2nd Shift": {
      foremen: [
        {
          name: "Danny Cross",
          id: "",
          technicians: [
            { name: "Steve Jostock", id: "148", notes: "" },
            { name: "Jim Carroll", id: "171", notes: "" },
            { name: "Mark Haehn", id: "189", notes: "" },
            { name: "Perry Krout", id: "155", notes: "" }
          ]
        }
      ]
    },
    "Field Service": {
      foremen: [
        {
          name: "Chris Valyo",
          id: "9133",
          technicians: [
            { name: "Austin Beye", id: "9161", notes: "ST1" },
            { name: "Brian Johnson", id: "9111", notes: "ST7" }
          ]
        }
      ]
    },
    "Body Shop": {
      foremen: [
        {
          name: "Devin Kahle",
          id: "151",
          technicians: [
            { name: "Ray Archer", id: "102", notes: "" },
            { name: "Colin Stanley", id: "172", notes: "" },
            { name: "Danny Marr", id: "190", notes: "" },
            { name: "Ricky Tetreault", id: "103", notes: "" },
            { name: "Austin Palmer", id: "716", notes: "" },
            { name: "Rick Parker", id: "179", notes: "" },
            { name: "Drew Stanley", id: "198", notes: "" },
            { name: "Josh Adair", id: "702", notes: "" }
          ]
        }
      ]
    },
    "PacLease": {
      foremen: [
        {
          name: "William Callison",
          id: "709",
          technicians: [
            { name: "Cayden Brandt", id: "127", notes: "" },
            { name: "Federico Lopez", id: "142", notes: "" },
            { name: "Logan Curless", id: "711", notes: "" },
            { name: "Owen Tingley", id: "713", notes: "" },
            { name: "Noe Fuentes", id: "759", notes: "" },
            { name: "Gabe Adams", id: "764", notes: "" }
          ]
        }
      ]
    },
    "Recon": {
      foremen: [
        {
          name: "Chris Schreiner",
          id: "756",
          technicians: [
            { name: "Devyn Thomas", id: "753", notes: "" },
            { name: "James Drake", id: "752", notes: "" },
            { name: "Kimble Thompson", id: "761", notes: "" },
            { name: "Michael Miller", id: "762", notes: "" },
            { name: "Aiden Adams", id: "765", notes: "" }
          ]
        }
      ]
    }
  });

  const [draggedItem, setDraggedItem] = useState<{
    technician: any;
    foremanIndex: number;
  } | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const correctPin = '1971';

  const handlePinSubmit = () => {
    if (pinInput === correctPin) {
      setIsLocked(false);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setDraggedItem(null);
    setDraggedFrom(null);
  };

  const handleDragStart = (e: any, technician: any, departmentName: string, foremanIndex: number) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    setDraggedItem({ technician, foremanIndex });
    setDraggedFrom(departmentName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: any, targetDepartment: string, targetForemanIndex: number) => {
    e.preventDefault();
    
    if (isLocked || !draggedItem || !draggedFrom) {
      return;
    }

    // Don't allow drop on same location
    if (targetDepartment === draggedFrom && targetForemanIndex === (draggedItem as any).foremanIndex) {
      setDraggedItem(null);
      setDraggedFrom(null);
      return;
    }

    setAssignments(prev => {
      const newAssignments = { ...prev };
      
      // Remove from source
      (newAssignments as any)[draggedFrom].foremen[(draggedItem as any).foremanIndex].technicians = 
        (newAssignments as any)[draggedFrom].foremen[(draggedItem as any).foremanIndex].technicians.filter(
          (tech: any) => tech.id !== (draggedItem as any).technician.id
        );
      
      // Add to target
      (newAssignments as any)[targetDepartment].foremen[targetForemanIndex].technicians.push(
        (draggedItem as any).technician
      );
      
      return newAssignments;
    });

    setDraggedItem(null);
    setDraggedFrom(null);
  };

  const getDepartmentIcon = (departmentName: string) => {
    if (departmentName.includes('Field')) return <Truck className="w-5 h-5" />;
    if (departmentName.includes('Body')) return <Wrench className="w-5 h-5" />;
    if (departmentName.includes('PacLease')) return <Package className="w-5 h-5" />;
    if (departmentName.includes('Recon')) return <RotateCcw className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getTotalTechnicians = (department: any) => {
    return department.foremen.reduce((total: number, foreman: any) => total + foreman.technicians.length, 0);
  };

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
            
            {/* Lock Controls */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded ${isLocked ? 'bg-red-600' : 'bg-green-600'}`}>
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isLocked ? 'LOCKED' : 'UNLOCKED'}
                </span>
              </div>
              
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
                  {departmentData.foremen.map((foreman: any, foremanIndex: number) => (
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
              <strong>Security:</strong> The system starts in LOCKED mode. Click "Unlock" and enter the PIN to enable editing.
            </p>
            <p className="text-red-700">
              <strong>Editing:</strong> When unlocked, drag and drop technicians between foremen to reassign them. 
              Each technician card shows their name, ID number, and special notes. 
              Click "Lock" to secure the system when finished editing.
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
                    Technicians | {departmentData.foremen.length} Foremen
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