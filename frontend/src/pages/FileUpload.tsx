import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Chip,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { FiUpload, FiFile, FiX, FiCheck, FiSearch } from 'react-icons/fi';
import { Icon } from '@mui/material';

type FileType = 'image' | 'video' | 'audio' | 'document' | null;

interface UploadedFile {
  file: File;
  type: FileType;
  preview: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export const FileUpload = () => {
  const [activeTab, setActiveTab] = useState<'media' | 'policies'>('media');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const storeIdFromStorage = localStorage.getItem('storeId');
    setStoreId(storeIdFromStorage);
  }, []);

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) return 'document';
    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (activeTab === 'media') {
      const newFiles = Array.from(e.dataTransfer.files)
        .filter(file => ['image', 'video', 'audio'].includes(getFileType(file) || ''))
        .map(file => ({
          file,
          type: getFileType(file),
          preview: URL.createObjectURL(file),
          status: 'uploading' as const,
          progress: 0,
        }));

      setFiles(prev => [...prev, ...newFiles]);
      handleUpload(newFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (activeTab === 'media') {
        const newFiles = Array.from(e.target.files)
          .filter(file => ['image', 'video', 'audio'].includes(getFileType(file) || ''))
          .map(file => ({
            file,
            type: getFileType(file),
            preview: URL.createObjectURL(file),
            status: 'uploading' as const,
            progress: 0,
          }));

        setFiles(prev => [...prev, ...newFiles]);
        handleUpload(newFiles);
      } else if (activeTab === 'policies' && storeId) {
        handlePolicyUpload(e.target.files[0]);
      }
    }
  };

  const handleUpload = async (filesToUpload: UploadedFile[]) => {
    setIsUploading(true);
    
    try {
      for (const file of filesToUpload) {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f => 
            f.file === file.file ? { ...f, progress } : f
          ));
        }
        
        setFiles(prev => prev.map(f => 
          f.file === file.file ? { ...f, status: 'completed' as const } : f
        ));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(f => 
        filesToUpload.some(uf => uf.file === f.file) ? { ...f, status: 'error' as const } : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handlePolicyUpload = async (file: File) => {
    if (!storeId) {
      console.error('Store ID not found');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stores/${storeId}/policy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload policy');
      }

      if (searchQuery) {
        await handlePolicySearch(searchQuery);
      }
      return true;
    } catch (error: any) {
      console.error('Policy upload failed:', error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePolicySearch = async (query: string) => {
    if (!storeId || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/stores/${storeId}/policy/search?query=${encodeURIComponent(query)}&k=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search policies');
      }

      const data = await response.json();
      setSearchResults(data.sources || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'media' | 'policies') => {
    event.preventDefault();
    setActiveTab(newValue);
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image':
        return <Icon component={FiFile} sx={{ color: 'primary.main' }} />;
      case 'video':
        return <Icon component={FiFile} sx={{ color: 'error.main' }} />;
      case 'audio':
        return <Icon component={FiFile} sx={{ color: 'success.main' }} />;
      case 'document':
        return <Icon component={FiFile} sx={{ color: 'warning.main' }} />;
      default:
        return <Icon component={FiFile} />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {activeTab === 'media' ? 'Upload Media for Analysis' : 'Store Policy Management'}
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
      >
        <Tab label="Media Upload" value="media" />
        <Tab label="Store Policies" value="policies" />
      </Tabs>

      {activeTab === 'media' ? (
        <div>
          <Paper
            elevation={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: isDragging ? 'primary.50' : 'grey.50',
              transition: 'all 0.2s',
              mb: 3,
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Icon component={FiUpload} sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Typography variant="h6">Drag & drop files here</Typography>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
              <input
                accept="image/*,video/*,audio/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <Button 
                  variant="contained" 
                  component="span"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Select Files'}
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary">
                Supported formats: Images, Videos, Audio
              </Typography>
            </Stack>
          </Paper>

          {files.length > 0 && (
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                {files.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      position: 'relative',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {getFileIcon(file.type)}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: 'medium' }}
                        >
                          {file.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(file.file.size / 1024)} KB
                        </Typography>
                        {file.status === 'uploading' && (
                          <LinearProgress
                            variant="determinate"
                            value={file.progress}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                      {file.status === 'completed' ? (
                        <Chip
                          icon={<Icon component={FiCheck} />}
                          label="Uploaded"
                          color="success"
                          size="small"
                        />
                      ) : file.status === 'error' ? (
                        <Chip
                          icon={<Icon component={FiX} />}
                          label="Error"
                          color="error"
                          size="small"
                        />
                      ) : null}
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        sx={{ color: 'error.main' }}
                        disabled={isUploading}
                      >
                        <Icon component={FiX} />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </div>
      ) : (
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              border: '1px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
              p: 3,
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <input
                accept=".txt"
                style={{ display: 'none' }}
                id="policy-upload"
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e);
                  }
                }}
                disabled={isUploading}
              />
              <label htmlFor="policy-upload">
                <Button
                  variant="outlined"
                  color="primary"
                  component="span"
                  startIcon={isUploading ? <CircularProgress size={20} /> : <Icon component={FiUpload} />}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Policy Document'}
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary">
                Upload a .txt file containing your store's policies
              </Typography>
            </Stack>
          </Paper>

          <Box>
            <Typography variant="h6" gutterBottom>
              Search Policies
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search in policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePolicySearch(searchQuery)}
                InputProps={{
                  startAdornment: <Icon component={FiSearch} sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                disabled={isUploading}
              />
              <Button
                variant="contained"
                onClick={() => handlePolicySearch(searchQuery)}
                disabled={!searchQuery.trim() || isUploading}
                startIcon={isUploading ? <CircularProgress size={20} /> : null}
              >
                {isUploading ? 'Searching...' : 'Search'}
              </Button>
            </Stack>

            {searchResults.length > 0 && (
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                <List>
                  {searchResults.map((result, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={result.filename || 'Policy Document'}
                          secondary={`Relevance: ${(result.score * 100).toFixed(1)}%`}
                        />
                        {result.content && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {result.content.length > 150 
                              ? `${result.content.substring(0, 150)}...` 
                              : result.content}
                          </Typography>
                        )}
                      </ListItem>
                      {index < searchResults.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default FileUpload;