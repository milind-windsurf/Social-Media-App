'use client';

/**
 * Avatar component that displays user initials with randomized background colors
 * @param {Object} props - Component props
 * @param {string} props.name - User's name for initials, accessibility and color generation
 * @param {string} props.size - Size of the avatar ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes
 */
export const Avatar = ({ name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl'
  };

  /**
   * Generate a consistent color based on the user's name
   * @param {string} name - User's name
   * @returns {Object} Object with background and text color classes
   */
  const generateColor = (name) => {
    // Simple hash function to convert name to a number
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Color palette with good contrast and accessibility
    const colors = [
      { bg: 'bg-red-400', text: 'text-white' },
      { bg: 'bg-blue-400', text: 'text-white' },
      { bg: 'bg-green-400', text: 'text-white' },
      { bg: 'bg-purple-400', text: 'text-white' },
      { bg: 'bg-pink-400', text: 'text-white' },
      { bg: 'bg-indigo-400', text: 'text-white' },
      { bg: 'bg-yellow-400', text: 'text-gray-800' },
      { bg: 'bg-teal-400', text: 'text-white' },
      { bg: 'bg-orange-400', text: 'text-white' },
      { bg: 'bg-cyan-400', text: 'text-white' },
      { bg: 'bg-emerald-400', text: 'text-white' },
      { bg: 'bg-rose-400', text: 'text-white' }
    ];
    
    // Use hash to select a color consistently
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  /**
   * Get initials from a name (first letter of first name and first letter of last name)
   * @param {string} name - Full name
   * @returns {string} Initials (1-2 characters)
   */
  const getInitials = (name) => {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      // If only one name, return first letter
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      // Return first letter of first name and first letter of last name
      return (
        nameParts[0].charAt(0).toUpperCase() + 
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    }
  };

  const colors = generateColor(name);
  const initials = getInitials(name);

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full ${colors.bg} flex items-center justify-center font-medium ${className}`}
      aria-label={`${name} avatar`}
    >
      <span className={`${fontSizes[size]} ${colors.text}`}>
        {initials}
      </span>
    </div>
  );
};
