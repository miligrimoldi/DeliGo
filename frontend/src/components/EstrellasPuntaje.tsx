import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

const EstrellasPuntaje = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {Array.from({ length: fullStars }, (_, i) => (
                <FontAwesomeIcon key={`full-${i}`} icon={solidStar} color="#4B614C" />
            ))}
            {hasHalfStar && (
                <FontAwesomeIcon icon={faStarHalfAlt} color="#4B614C" />
            )}
            {Array.from({ length: emptyStars }, (_, i) => (
                <FontAwesomeIcon key={`empty-${i}`} icon={regularStar} color="#ccc" />
            ))}
        </div>
    );
};

export default EstrellasPuntaje;