"use client";

import { useState, useEffect } from 'react';
import { X, Recycle, ChevronDown, ChevronUp } from 'lucide-react';
import { inputClassName } from '@/components/admin/shared/FormModal';
import {
  WasteData,
  CreateWasteData,
  createWasteData,
  updateWasteData,
} from '@/lib/admin/siteDataApi';
import { Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface WasteDataFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData: WasteData | null;
  sites: Site[];
}

export default function WasteDataFormModal({
  open,
  onClose,
  onSuccess,
  editingData,
  sites,
}: WasteDataFormModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Basic Form state
  const [siteId, setSiteId] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [organicWaste, setOrganicWaste] = useState<number | ''>('');
  const [inorganicWaste, setInorganicWaste] = useState<number | ''>('');
  const [rawMeatWaste, setRawMeatWaste] = useState<number | ''>('');
  const [totalWaste, setTotalWaste] = useState<number | ''>('');
  
  // Compost & Recovery
  const [compostReceived, setCompostReceived] = useState<number | ''>('');
  const [compostQuality, setCompostQuality] = useState<string>('');
  const [recoveryRatio, setRecoveryRatio] = useState<number | ''>('');
  
  // Environmental Impact
  const [methaneRecovered, setMethaneRecovered] = useState<number | ''>('');
  const [methaneSaved, setMethaneSaved] = useState<number | ''>('');
  const [co2Equivalent, setCo2Equivalent] = useState<number | ''>('');
  
  // Processing Details
  const [landfillDiverted, setLandfillDiverted] = useState<number | ''>('');
  const [recyclingRate, setRecyclingRate] = useState<number | ''>('');
  const [disposalMethod, setDisposalMethod] = useState<string>('');
  
  // Notes
  const [notes, setNotes] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');

  // Populate form when editing
  useEffect(() => {
    if (editingData) {
      setSiteId(editingData.siteId);
      setYear(editingData.year);
      setOrganicWaste(editingData.organicWaste);
      setInorganicWaste((editingData as any).inorganicWaste || '');
      setRawMeatWaste((editingData as any).rawMeatWaste || '');
      setTotalWaste((editingData as any).totalWaste || '');
      setCompostReceived(editingData.compostReceived);
      setCompostQuality((editingData as any).compostQuality || '');
      setRecoveryRatio((editingData as any).recoveryRatio || '');
      setMethaneRecovered(editingData.methaneRecovered || '');
      setMethaneSaved((editingData as any).methaneSaved || '');
      setCo2Equivalent((editingData as any).co2Equivalent || '');
      setLandfillDiverted((editingData as any).landfillDiverted || '');
      setRecyclingRate((editingData as any).recyclingRate || '');
      setDisposalMethod((editingData as any).disposalMethod || '');
      setNotes((editingData as any).notes || '');
      setDataSource((editingData as any).dataSource || '');
    } else {
      // Reset form
      setSiteId('');
      setYear(new Date().getFullYear());
      setOrganicWaste('');
      setInorganicWaste('');
      setRawMeatWaste('');
      setTotalWaste('');
      setCompostReceived('');
      setCompostQuality('');
      setRecoveryRatio('');
      setMethaneRecovered('');
      setMethaneSaved('');
      setCo2Equivalent('');
      setLandfillDiverted('');
      setRecyclingRate('');
      setDisposalMethod('');
      setNotes('');
      setDataSource('');
    }
  }, [editingData, open]);


  // Auto-calculate totals
  useEffect(() => {
    if (organicWaste || inorganicWaste || rawMeatWaste) {
      const total = (Number(organicWaste) || 0) + (Number(inorganicWaste) || 0) + (Number(rawMeatWaste) || 0);
      if (total > 0 && !totalWaste) {
        setTotalWaste(total);
      }
    }
  }, [organicWaste, inorganicWaste, rawMeatWaste]);

  // Auto-calculate recovery ratio
  useEffect(() => {
    if (compostReceived && organicWaste && Number(organicWaste) > 0) {
      const ratio = ((Number(compostReceived) / Number(organicWaste)) * 100);
      setRecoveryRatio(Number(ratio.toFixed(2)));
    }
  }, [compostReceived, organicWaste]);

  // Calculate conversion rate
  const conversionRate = organicWaste && organicWaste > 0
    ? ((Number(compostReceived) / Number(organicWaste)) * 100).toFixed(1)
    : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteId || !year || organicWaste === '' || compostReceived === '') {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        siteId: Number(siteId),
        year: Number(year),
        organicWaste: Number(organicWaste),
        compostReceived: Number(compostReceived),
      };

      // Add optional fields if they have values
      if (inorganicWaste) payload.inorganicWaste = Number(inorganicWaste);
      if (rawMeatWaste) payload.rawMeatWaste = Number(rawMeatWaste);
      if (totalWaste) payload.totalWaste = Number(totalWaste);
      if (compostQuality) payload.compostQuality = compostQuality;
      if (recoveryRatio) payload.recoveryRatio = Number(recoveryRatio);
      if (methaneRecovered) payload.methaneRecovered = Number(methaneRecovered);
      if (methaneSaved) payload.methaneSaved = Number(methaneSaved);
      if (co2Equivalent) payload.co2Equivalent = Number(co2Equivalent);
      if (landfillDiverted) payload.landfillDiverted = Number(landfillDiverted);
      if (recyclingRate) payload.recyclingRate = Number(recyclingRate);
      if (disposalMethod) payload.disposalMethod = disposalMethod;
      if (notes) payload.notes = notes;
      if (dataSource) payload.dataSource = dataSource;

      if (editingData) {
        await updateWasteData(editingData.id, payload);
        showToast('Waste data updated successfully', 'success');
      } else {
        await createWasteData(payload);
        showToast('Waste data created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save waste data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Generate year options (from 2019 to 2100)
  const yearOptions = [];
  for (let y = 2019; y <= 2100; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Recycle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingData ? 'Edit Waste Data' : 'Add Waste Data'}
                </h2>
                <p className="text-sm text-gray-500">
                  Enter organic waste and composting information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Site and Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site *
                  </label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    disabled={!!editingData}
                    required
                  >
                    <option value="">Select site...</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select year...</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Waste Breakdown Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                  Waste Breakdown (tonnes)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Organic Waste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organic Waste *
                    </label>
                    <input
                      type="number"
                      value={organicWaste}
                      onChange={(e) => setOrganicWaste(e.target.value ? Number(e.target.value) : '')}
                      className={inputClassName}
                      placeholder="50.0"
                      min={0}
                      step={0.01}
                      required
                    />
                  </div>

                  {/* Inorganic Waste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inorganic Waste
                    </label>
                    <input
                      type="number"
                      value={inorganicWaste}
                      onChange={(e) => setInorganicWaste(e.target.value ? Number(e.target.value) : '')}
                      className={inputClassName}
                      placeholder="10.0"
                      min={0}
                      step={0.01}
                    />
                  </div>

                  {/* Raw Meat Waste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Raw Meat Waste
                    </label>
                    <input
                      type="number"
                      value={rawMeatWaste}
                      onChange={(e) => setRawMeatWaste(e.target.value ? Number(e.target.value) : '')}
                      className={inputClassName}
                      placeholder="2.5"
                      min={0}
                      step={0.01}
                    />
                  </div>

                  {/* Total Waste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Waste
                    </label>
                    <input
                      type="number"
                      value={totalWaste}
                      onChange={(e) => setTotalWaste(e.target.value ? Number(e.target.value) : '')}
                      className={`${inputClassName} bg-gray-50`}
                      placeholder="Auto-calculated"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>

              {/* Compost & Recovery Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                  Compost & Recovery
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Compost Received */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compost Received (tonnes) *
                    </label>
                    <input
                      type="number"
                      value={compostReceived}
                      onChange={(e) => setCompostReceived(e.target.value ? Number(e.target.value) : '')}
                      className={inputClassName}
                      placeholder="25.0"
                      min={0}
                      step={0.01}
                      required
                    />
                  </div>

                  {/* Compost Quality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compost Quality
                    </label>
                    <select
                      value={compostQuality}
                      onChange={(e) => setCompostQuality(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select quality...</option>
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>

                  {/* Recovery Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recovery Ratio (%)
                    </label>
                    <input
                      type="number"
                      value={recoveryRatio}
                      onChange={(e) => setRecoveryRatio(e.target.value ? Number(e.target.value) : '')}
                      className={`${inputClassName} bg-gray-50`}
                      placeholder="Auto-calculated"
                      min={0}
                      max={100}
                      step={0.01}
                    />
                  </div>

                  {/* Landfill Diverted */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landfill Diverted (tonnes)
                    </label>
                    <input
                      type="number"
                      value={landfillDiverted}
                      onChange={(e) => setLandfillDiverted(e.target.value ? Number(e.target.value) : '')}
                      className={inputClassName}
                      placeholder="45.0"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Fields - Collapsible */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>
              </div>

              {showAdvanced && (
                <>
                  {/* Environmental Impact Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                      Environmental Impact
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Methane Recovered */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Methane Recovered (m³)
                        </label>
                        <input
                          type="number"
                          value={methaneRecovered}
                          onChange={(e) => setMethaneRecovered(e.target.value ? Number(e.target.value) : '')}
                          className={inputClassName}
                          placeholder="150.0"
                          min={0}
                          step={0.01}
                        />
                      </div>

                      {/* Methane Saved */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Methane Saved (kg CH₄ eq)
                        </label>
                        <input
                          type="number"
                          value={methaneSaved}
                          onChange={(e) => setMethaneSaved(e.target.value ? Number(e.target.value) : '')}
                          className={inputClassName}
                          placeholder="1200.0"
                          min={0}
                          step={0.01}
                        />
                      </div>

                      {/* CO2 Equivalent */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CO₂ Equivalent (tonnes)
                        </label>
                        <input
                          type="number"
                          value={co2Equivalent}
                          onChange={(e) => setCo2Equivalent(e.target.value ? Number(e.target.value) : '')}
                          className={inputClassName}
                          placeholder="30.0"
                          min={0}
                          step={0.01}
                        />
                      </div>

                      {/* Recycling Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recycling Rate (%)
                        </label>
                        <input
                          type="number"
                          value={recyclingRate}
                          onChange={(e) => setRecyclingRate(e.target.value ? Number(e.target.value) : '')}
                          className={inputClassName}
                          placeholder="75.0"
                          min={0}
                          max={100}
                          step={0.01}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Processing Details Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                      Processing Details
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Disposal Method
                      </label>
                      <select
                        value={disposalMethod}
                        onChange={(e) => setDisposalMethod(e.target.value)}
                        className={inputClassName}
                      >
                        <option value="">Select method...</option>
                        <option value="Composting">Composting</option>
                        <option value="Anaerobic Digestion">Anaerobic Digestion</option>
                        <option value="Landfill">Landfill</option>
                        <option value="Incineration">Incineration</option>
                        <option value="Recycling">Recycling</option>
                        <option value="Mixed">Mixed Methods</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Source
                      </label>
                      <input
                        type="text"
                        value={dataSource}
                        onChange={(e) => setDataSource(e.target.value)}
                        className={inputClassName}
                        placeholder="e.g., Monthly Site Report"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={inputClassName}
                        placeholder="Additional notes or comments..."
                        rows={3}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Conversion Rate Display */}
              {organicWaste && Number(organicWaste) > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                    <span className={`text-lg font-bold ${
                      Number(conversionRate) >= 50 ? 'text-green-700' :
                      Number(conversionRate) >= 25 ? 'text-amber-700' : 'text-gray-700'
                    }`}>
                      {conversionRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of organic waste converted to compost
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingData ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
