import { Button } from './Button/Button';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Searchbar } from './Searchbar/Searchbar';
import { fetchImages } from '../api.js';
import { Toaster } from 'react-hot-toast';
import { Loader } from './Loader/Loader';
import { ModalWindow } from './Modal/Modal';
import { useState, useEffect, useRef } from 'react';

export const App = () => {
  const [query, setQuery] = useState('');
  const [queryId, setQueryId] = useState(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hits, setHits] = useState(0);
  const [imageSrc, setImageSrc] = useState('');

  const prevQueryRef = useRef(query);
  const prevPageRef = useRef(page);
  const prevQueryIdRef = useRef(queryId);

  useEffect(() => {
    async function getImages() {
      if (
        query &&
        (prevQueryRef !== query ||
          prevPageRef !== page ||
          prevQueryIdRef !== queryId)
      ) {
        try {
          setLoading(true);
          setError(false);
          const newImages = await fetchImages(query, page);
          setImages(prevImages => [...prevImages, ...newImages.hits]);
          setHits(newImages.totalHits);
          setError(false);
        } catch (error) {
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    }
    getImages();
  }, [query, page, queryId]);

  const handleSubmit = value => {
    setQuery(value);
    setQueryId(Date.now());
    setImages([]);
    setPage(1);
    setHits(0);
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };
  const openModal = image => {
    setImageSrc(image);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setImageSrc('');
  };

  return (
    <div className="App">
      <Searchbar onSubmit={handleSubmit} />
      {loading && <Loader loading={loading} className="Loader" />}
      {error && !loading && (
        <div>There was an error! Please try to reload the page.</div>
      )}
      {images.length > 0 && (
        <ImageGallery images={images} openModal={openModal} />
      )}
      {images.length > 0 && images.length < hits && (
        <Button onLoadMore={handleLoadMore} />
      )}
      <Toaster position="top-center" error={error} />
      <ModalWindow
        isOpen={isOpen}
        onRequestClose={closeModal}
        image={imageSrc}
      />
    </div>
  );
};
