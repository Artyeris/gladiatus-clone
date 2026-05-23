const ProgressBar = ({ progress }: { progress: number }) => {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));

  return (
    <div className='relative w-full overflow-hidden h-2 rounded-sm bg-brown2'>
      <div
        style={{
          height: '100%',
          width: `${clamped}%`,
          backgroundColor: '#e6b749',
          boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.5)',
        }}
      />
    </div>
  );
};

export default ProgressBar;