import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { Icon } from '@mui/material';

type FileType = 'image' | 'video' | 'audio' | null;

interface UploadedFile {
  file: File;
  type: FileType;
  preview: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export const FileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
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
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (fileList: File[]) => {
    const newFiles = fileList.map(file => {
      const type = getFileType(file);
      return {
        file,
        type,
        preview: type === 'image' ? URL.createObjectURL(file) : '',
        status: 'uploading' as const,
        progress: 0
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach((_, index) => {
      const fileIndex = files.length + index;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setFiles(prev => {
            const updated = [...prev];
            updated[fileIndex].status = 'completed';
            updated[fileIndex].progress = 100;
            return updated;
          });
        } else {
          setFiles(prev => {
            const updated = [...prev];
            updated[fileIndex].progress = progress;
            return updated;
          });
        }
      }, 200);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1);
      if (removed[0].preview) {
        URL.revokeObjectURL(removed[0].preview);
      }
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFiles([]);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Upload Media for Analysis
      </Typography>
      
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
          <Icon component={FiUpload} sx={{ fontSize: 32, color: 'text.secondary' }} />
          <Box>
            <Typography fontWeight={500}>Drag & drop files here, or click to select</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Supports images, videos, and audio files
            </Typography>
          </Box>
          <Button
            component="label"
            variant="outlined"
            color="primary"
            startIcon={<Icon component={FiFile} />}
          >
            Choose Files
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInput}
              accept="image/*,video/*,audio/*"
            />
          </Button>
        </Stack>
      </Paper>

      {files.length > 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography fontWeight={500}>Files to upload ({files.length})</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isUploading}
              size="small"
            >
              {isUploading ? 'Uploading...' : 'Upload All'}
            </Button>
          </Stack>

          <Stack spacing={2}>
            {files.map((file, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 1,
                  p: 2,
                  position: 'relative',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ fontSize: '2rem' }}>
                    {file.type === 'image' && file.preview ? (
                      <Box
                        component="img"
                        src={file.preview}
                        alt={file.file.name}
                        sx={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    ) : (
                      <span>{getFileIcon(file.type)}</span>
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      noWrap
                      title={file.file.name}
                    >
                      {file.file.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label={file.type || 'file'}
                        color={
                          file.type === 'image' ? 'success' : file.type === 'video' ? 'error' : 'primary'
                        }
                        size="small"
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Stack>
                  </Box>
                  {file.status === 'completed' ? (
                    <Icon component={FiCheck} sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <Icon component={FiX} />
                    </IconButton>
                  )}
                </Stack>
                
                {file.status === 'uploading' && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={file.progress}
                      size="small"
                      sx={{ borderRadius: '9999px' }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'right', display: 'block' }}>
                      {Math.round(file.progress)}%
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
