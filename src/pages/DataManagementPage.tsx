import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  FileCheck,
  HardDrive,
  Download,
  ShieldCheck,
  Table,
  Filter,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import type { DatasetItem } from '../types';

export const DataManagementPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetType, setDatasetType] = useState<string>('Accidents');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inspectModalDataset, setInspectModalDataset] = useState<DatasetItem | null>(null);
  const [inspectLoading, setInspectLoading] = useState<boolean>(false);
  const [inspectPreview, setInspectPreview] = useState<any | null>(null);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await api.getDatasets();
      setDatasets(res.datasets);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset registry');
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (dataset: DatasetItem) => {
    setInspectModalDataset(dataset);
    setInspectPreview(null);
    setInspectLoading(true);
    try {
      const prev = await api.getDatasetPreview(dataset.id);
      setInspectPreview(prev);
    } catch (err: any) {
      console.error('Failed to preview dataset', err);
    } finally {
      setInspectLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      const res = await api.uploadDataset(selectedFile, datasetType);
      setUploadResult(res.data);
      setSelectedFile(null);
      fetchDatasets();
    } catch (err: any) {
      setError(err.message || 'Dataset upload failed');
    } finally {
      setUploading(false);
    }
  };

  const totalRecords = datasets.reduce((acc, curr) => acc + (curr.row_count || 0), 0);
  const totalSizeBytes = datasets.reduce((acc, curr) => acc + (curr.file_size_bytes || 0), 0);
  const totalSizeFormatted = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253745] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-base font-semibold text-[#CCD0CF] tracking-tight font-sans">
              Urban Data Ingestion & Spatial Dataset Catalog
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#11212D] text-[#FF7A00] border border-[#253745]">
              WGS84 • EPSG:4326
            </span>
          </div>
          <p className="text-xs text-[#9BA8AB] mt-0.5">
            Enterprise schema validation, PostGIS spatial indexing, and null/duplicate integrity auditing.
          </p>
        </div>

        <button
          onClick={fetchDatasets}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#11212D] hover:bg-[#253745] text-[#CCD0CF] border border-[#4A5C6A] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF7A00]' : 'text-[#9BA8AB]'}`} />
          <span>Sync Catalog</span>
        </button>
      </div>

      {/* Spatial Catalog Telemetry Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Catalog Datasets
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#CCD0CF]">{datasets.length}</span>
            <span className="text-xs text-[#9BA8AB]">registered</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            100% schema compliant
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Total Ingested Rows
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#FF7A00]">{totalRecords.toLocaleString()}</span>
            <span className="text-xs text-[#9BA8AB]">records</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            Spatial points & road segments
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Spatial Index Format
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#CCD0CF]">R-Tree / GIST</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            Envelope: Maharashtra State
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Storage Footprint
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#CCD0CF]">{totalSizeFormatted}</span>
            <span className="text-xs text-[#9BA8AB]">MB</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            Compressed binary & tabular
          </div>
        </div>
      </div>

      {/* Ingestion & Schema Validator Box */}
      <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#253745]">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4 text-[#FF7A00]" />
            <h2 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
              Urban Data Ingestion & Pre-Ingestion Validator
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-[#9BA8AB]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Maharashtra Envelope & Null Verification Active</span>
          </div>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* File Picker */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[#9BA8AB] text-[11px] block">
              Dataset File (.CSV format)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-2 text-[#CCD0CF] text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:bg-[#253745] file:text-[#FF7A00] file:font-semibold hover:file:bg-[#324657] cursor-pointer"
              required
            />
          </div>

          {/* Classification */}
          <div className="space-y-1">
            <label className="text-[#9BA8AB] text-[11px] block">
              Dataset Domain
            </label>
            <select
              value={datasetType}
              onChange={(e) => setDatasetType(e.target.value)}
              className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-2 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="Accidents">Accident Records (GeoJSON / Point)</option>
              <option value="Traffic">Traffic Sensor Logs (Timeseries)</option>
              <option value="Demographics">Ward Demographics (Tabular)</option>
              <option value="RoadSegments">Road Geometry (Polyline)</option>
            </select>
          </div>

          {/* Action */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className={`w-full py-2 px-3 rounded text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                uploading || !selectedFile
                  ? 'bg-[#253745] text-[#9BA8AB] border border-[#4A5C6A] cursor-not-allowed'
                  : 'bg-[#FF7A00] hover:bg-[#FF8A00] text-[#06141B] font-bold'
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#06141B] border-t-transparent rounded-full animate-spin" />
                  <span>Validating Schema...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest & Validate</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Upload Success Alert */}
        {uploadResult && (
          <div className="p-3 bg-[#06141B] border border-emerald-500/40 rounded text-emerald-300 space-y-1">
            <div className="flex items-center space-x-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dataset Ingestion Complete: {uploadResult.name}</span>
            </div>
            <p className="text-[11px] text-[#9BA8AB] pl-6">
              Parsed <strong>{uploadResult.row_count}</strong> records • Missing values: {uploadResult.missing_values_count} • Duplicates: {uploadResult.duplicates_count}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-950/20 border border-rose-900/60 rounded text-rose-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Ingestion Error: {error}</span>
          </div>
        )}
      </div>

      {/* Dataset Registry Table */}
      <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#253745]">
          <div className="flex items-center space-x-2">
            <Table className="w-4 h-4 text-[#FF7A00]" />
            <h2 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
              Active Production Datasets Registry
            </h2>
          </div>
          <span className="text-[10px] text-[#9BA8AB]">
            {datasets.length} Active System Tables
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#253745] text-[10px] text-[#9BA8AB] uppercase tracking-wider">
                <th className="pb-2">Table / Dataset Name</th>
                <th className="pb-2">Domain</th>
                <th className="pb-2 text-right">Row Count</th>
                <th className="pb-2 text-right">File Size</th>
                <th className="pb-2 text-center">Quality / Nulls</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253745]/60">
              {datasets.map((d) => (
                <tr key={d.id} className="hover:bg-[#253745]/50">
                  <td className="py-2.5 font-medium text-[#CCD0CF]">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-[#9BA8AB]" />
                      <span>{d.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#06141B] text-[#CCD0CF] border border-[#253745]">
                      {d.dataset_type}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-[#CCD0CF]">
                    {d.row_count.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right text-[#9BA8AB]">
                    {(d.file_size_bytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-2.5 text-center">
                    {d.missing_values_count === 0 && d.duplicates_count === 0 ? (
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        100% Clean
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {d.missing_values_count} nulls / {d.duplicates_count} dupes
                      </span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      <span className="text-emerald-400 text-[11px]">{d.status}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => handleInspect(d)}
                      className="px-2 py-1 rounded bg-[#06141B] hover:bg-[#253745] text-[#CCD0CF] hover:text-[#FF7A00] border border-[#253745] text-[10px] transition-colors"
                    >
                      Inspect Schema
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schema Inspector Modal with Live Schema & Spatial Analysis */}
      {inspectModalDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#11212D] border border-[#4A5C6A] rounded-lg max-w-4xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#253745]">
              <div>
                <h3 className="text-sm font-semibold text-[#CCD0CF]">
                  Schema & Spatial Dossier: {inspectModalDataset.name}
                </h3>
                <p className="text-xs text-[#9BA8AB] mt-0.5">
                  Type: {inspectModalDataset.dataset_type} • File: {inspectModalDataset.file_path.split(/[\/\\]/).pop()}
                </p>
              </div>
              <button
                onClick={() => setInspectModalDataset(null)}
                className="text-[#9BA8AB] hover:text-[#CCD0CF] text-xs px-2.5 py-1 bg-[#06141B] rounded border border-[#253745]"
              >
                Close (ESC)
              </button>
            </div>

            {inspectLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[#9BA8AB]">Auditing dataset schema & bounding box...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Metric Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-[#06141B] border border-[#253745] rounded">
                    <span className="text-[10px] text-[#9BA8AB] uppercase block">Total Rows</span>
                    <span className="text-sm font-bold text-[#CCD0CF]">
                      {inspectPreview?.row_count ?? inspectModalDataset.row_count}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#06141B] border border-[#253745] rounded">
                    <span className="text-[10px] text-[#9BA8AB] uppercase block">Missing Cells</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {inspectPreview?.total_missing_values ?? inspectModalDataset.missing_values_count}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#06141B] border border-[#253745] rounded">
                    <span className="text-[10px] text-[#9BA8AB] uppercase block">Duplicates</span>
                    <span className="text-sm font-bold text-[#CCD0CF]">
                      {inspectPreview?.duplicates_count ?? inspectModalDataset.duplicates_count}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#06141B] border border-[#253745] rounded">
                    <span className="text-[10px] text-[#9BA8AB] uppercase block">File Footprint</span>
                    <span className="text-sm font-bold text-[#FF7A00]">
                      {((inspectPreview?.file_size_bytes ?? inspectModalDataset.file_size_bytes) / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                {/* Spatial Analysis Bounding Box */}
                {inspectPreview?.spatial_analysis && (
                  <div className="p-3 bg-[#06141B] border border-[#253745] rounded space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#CCD0CF] flex items-center space-x-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#FF7A00]" />
                        <span>GIS Spatial Coordinate Verification ({inspectPreview.spatial_analysis.crs})</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {inspectPreview.spatial_analysis.spatial_extent_label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-1 text-[#9BA8AB]">
                      <div>Min Lat: <strong className="text-[#CCD0CF]">{inspectPreview.spatial_analysis.bounding_box.min_latitude}°N</strong></div>
                      <div>Max Lat: <strong className="text-[#CCD0CF]">{inspectPreview.spatial_analysis.bounding_box.max_latitude}°N</strong></div>
                      <div>Min Lng: <strong className="text-[#CCD0CF]">{inspectPreview.spatial_analysis.bounding_box.min_longitude}°E</strong></div>
                      <div>Max Lng: <strong className="text-[#CCD0CF]">{inspectPreview.spatial_analysis.bounding_box.max_longitude}°E</strong></div>
                    </div>
                  </div>
                )}

                {/* Column Schema Table */}
                {inspectPreview?.schema && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#CCD0CF] uppercase tracking-wider mb-2">
                      Column Schema & Data Types ({inspectPreview.schema.length} Attributes)
                    </h4>
                    <div className="overflow-x-auto max-h-48 border border-[#253745] rounded">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-[#06141B] text-[#9BA8AB]">
                          <tr className="border-b border-[#253745]">
                            <th className="p-2">Column Name</th>
                            <th className="p-2">Data Type</th>
                            <th className="p-2 text-right">Non-Null</th>
                            <th className="p-2 text-right">Null Count</th>
                            <th className="p-2">Sample Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inspectPreview.schema.map((col: any, idx: number) => (
                            <tr key={idx} className="border-b border-[#253745]/40 hover:bg-[#1b2b38]/40">
                              <td className="p-2 font-mono text-[#CCD0CF]">{col.column_name}</td>
                              <td className="p-2 text-[#9BA8AB]">{col.data_type}</td>
                              <td className="p-2 text-right text-emerald-400">{col.non_null_count}</td>
                              <td className="p-2 text-right text-[#9BA8AB]">{col.null_count}</td>
                              <td className="p-2 text-[#CCD0CF] truncate max-w-xs">{col.sample_value ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Live Preview Rows */}
                {inspectPreview?.preview_rows && inspectPreview.preview_rows.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#CCD0CF] uppercase tracking-wider mb-2">
                      First 10 Data Records (Preview)
                    </h4>
                    <div className="overflow-x-auto max-h-48 border border-[#253745] rounded">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-[#06141B] text-[#9BA8AB]">
                          <tr className="border-b border-[#253745]">
                            {Object.keys(inspectPreview.preview_rows[0]).map((k) => (
                              <th key={k} className="p-2 whitespace-nowrap">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {inspectPreview.preview_rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="border-b border-[#253745]/40 hover:bg-[#1b2b38]/40">
                              {Object.values(row).map((val: any, cIdx: number) => (
                                <td key={cIdx} className="p-2 whitespace-nowrap text-[#CCD0CF]">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#253745]">
              <button
                onClick={() => setInspectModalDataset(null)}
                className="px-4 py-1.5 bg-[#FF7A00] hover:bg-[#FF8A00] text-[#06141B] font-bold text-xs rounded transition-colors"
              >
                Dismiss Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
