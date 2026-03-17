import { useCallback }   from 'react';
import { useDropzone }   from 'react-dropzone';
import { UploadCloud }   from 'lucide-react';
import { cn }            from '../lib/utils';
import { motion } from 'framer-motion';

/**
 * Drag-and-drop file upload zone built on react-dropzone.
 * Accepts a single file at a time and calls onFileSelected(file).
 */
export default function DropzoneUpload({ onFileSelected, onFilesSelected, disabled = false }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      if (onFilesSelected) {
        onFilesSelected(acceptedFiles);
      } else if (onFileSelected) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: true,
    disabled,
    maxSize: 50 * 1024 * 1024, // 50 MB
  });

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...getRootProps()}
      className={cn(
        'glass flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center transition-all shadow-sm',
        isDragActive  && !isDragReject && 'border-primary bg-primary/10 shadow-primary/20 shadow-lg scale-[1.02]',
        isDragReject  && 'border-destructive bg-destructive/10',
        !isDragActive && 'border-border/50 hover:border-primary/50 hover:bg-accent/40',
        disabled      && 'cursor-not-allowed opacity-50'
      )}
    >
      <input {...getInputProps()} />
      <motion.div
        animate={isDragActive ? { y: [0, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <UploadCloud
          size={56}
          className={cn('mb-6', isDragActive ? 'text-primary' : 'text-muted-foreground')}
        />
      </motion.div>
      {isDragActive && !isDragReject && (
        <p className="text-lg font-medium text-primary">Drop it here!</p>
      )}
      {isDragReject && (
        <p className="text-lg font-medium text-destructive">File type or size not allowed</p>
      )}
      {!isDragActive && (
        <>
          <p className="text-base font-medium">Drag &amp; drop a file here</p>
          <p className="mt-1 text-sm text-muted-foreground">or click to browse your device</p>
          <p className="mt-3 text-xs text-muted-foreground">Max file size: 50 MB</p>
        </>
      )}
    </motion.div>
  );
}
