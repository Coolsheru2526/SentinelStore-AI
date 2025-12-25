import { useState } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  Heading, 
  Text,
  Icon,
  Flex,
  Image,
  Progress,
  HStack,
  Badge
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';

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
      // Revoke the object URL to avoid memory leaks
      if (removed[0].preview) {
        URL.revokeObjectURL(removed[0].preview);
      }
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear files after successful upload
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
      <Heading size="lg" mb={6}>
        Upload Media for Analysis
      </Heading>
      
      <Box
        border="2px dashed"
        borderColor={isDragging ? 'blue.400' : 'gray.300'}
        borderRadius="lg"
        p={8}
        textAlign="center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        bg={isDragging ? 'blue.50' : 'gray.50'}
        transition="all 0.2s"
        mb={6}
      >
        <VStack gap={4}>
          <Icon as={FiUpload} boxSize={8} color="gray.400" />
          <Box>
            <Text fontWeight="medium">Drag & drop files here, or click to select</Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Supports images, videos, and audio files
            </Text>
          </Box>
          <Button
            as="label"
            colorScheme="blue"
            variant="outline"
            cursor="pointer"
          >
            <Icon as={FiFile} mr={2} />
            Choose Files
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInput}
              accept="image/*,video/*,audio/*"
            />
          </Button>
        </VStack>
      </Box>

      {files.length > 0 && (
        <Box>
          <HStack justify="space-between" mb={4}>
            <Text fontWeight="medium">Files to upload ({files.length})</Text>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              loading={isUploading}
              loadingText="Uploading..."
              size="sm"
            >
              Upload All
            </Button>
          </HStack>

          <VStack gap={4} align="stretch">
            {files.map((file, index) => (
              <Box
                key={index}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                position="relative"
                bg="white"
              >
                <Flex align="center" justify="space-between">
                  <HStack gap={4} flex={1} minW={0}>
                    <Box fontSize="2xl">
                      {file.type === 'image' && file.preview ? (
                        <Image
                          src={file.preview}
                          alt={file.file.name}
                          boxSize="40px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <span>{getFileIcon(file.type)}</span>
                      )}
                    </Box>
                    <Box minW={0} flex={1}>
                      <Text
                        truncate
                        fontWeight="medium"
                        title={file.file.name}
                      >
                        {file.file.name}
                      </Text>
                      <HStack gap={2} mt={1}>
                        <Badge colorScheme={file.type === 'image' ? 'green' : file.type === 'video' ? 'red' : 'blue'}>
                          {file.type || 'file'}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </HStack>
                    </Box>
                    {file.status === 'completed' ? (
                      <Icon as={FiCheck} color="green.500" boxSize={5} />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <Icon as={FiX} />
                      </Button>
                    )}
                  </HStack>
                </Flex>
                
                {file.status === 'uploading' && (
                  <Box mt={2}>
                    <Progress.Root
                      value={file.progress}
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                      {Math.round(file.progress)}%
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};
