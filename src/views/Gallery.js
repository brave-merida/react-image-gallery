import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';

import ThumbnailCard from '../components/ThumbnailCard';
import Preview from '../components/Preview';
import Waiting from '../components/Waiting';
import * as ACTION_TYPE from '../action'
import './index.css';

const PAGE_SIZE = 20;

const Gallery = ({
  photos = [],
  error = undefined,
  favouriteCount = 0,
  dispatchFetchPhoto = (() => {}),
  dispatchFavourite = ((index) => {})
}) => {

  const [loading, setLoading]         = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagePhotos, setPagePhotos]   = useState([]);
  const [selectedUrl, setSelectedUrl] = useState();

  const changePage                    = (page) => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const _pagePhotos = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= photos.length) break;
      _pagePhotos.push(photos[i]);
    }
    setPagePhotos(_pagePhotos);
    setCurrentPage(page);
  }

  const onSelect                      = (url) => (event) => setSelectedUrl(url);
  const onFavourite                   = (index) => (isFavourite) => dispatchFavourite(index, isFavourite);

  useEffect(() => {
    if (!loading) {
      setLoading(true);
      dispatchFetchPhoto();
    }
  }, []);

  useEffect(() => {
    if (photos.length > 0 || error) {
      setLoading(false);
      changePage(1);
    }
  }, [photos.length, error]);

  return (
    <div className="gallery">
      <Waiting on={!loading}>
        {!loading &&
          <React.Fragment>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <p>Number of your favourite images: &nbsp; &nbsp;</p>
              <p>{favouriteCount}</p>
            </div>
            <Preview imageUrl={selectedUrl} />
            <div className="thumbnails-container">
              <div className="thumbnails-content">
                {pagePhotos.map((item, index) => {
                  const { albumId, id, title, url, thumbnailUrl, isFavourite } = item;
                  const isSelected = (selectedUrl && selectedUrl === url);
                  return (
                    <ThumbnailCard
                      key={index}
                      thumbnailUrl={thumbnailUrl}
                      title={title}
                      isSelected={isSelected}
                      onClick={onSelect(url)}
                      isFavourite={isFavourite}
                      onFavourite={onFavourite(index)}
                    />
                  )
                })}
              </div>
            </div>
            <Pagination current={currentPage} total={photos.length} onChange={changePage} pageSize={PAGE_SIZE} />
          </React.Fragment>
        }
      </Waiting>
    </div>
  )

}

const mapStateToProps = state => {
  const { photoReducer } = state;
  return {
    photos: photoReducer.photos,
    error: photoReducer.error,
    favouriteCount: photoReducer.favouriteCount,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatchFetchPhoto: ((payload) => {
      dispatch({
        type: ACTION_TYPE.FETCH_PHOTO,
        payload
      })
    }),
    dispatchFavourite: ((index, isFavourite) => {
      dispatch({
        type: ACTION_TYPE.SET_FAVOURITE,
        payload: { index, isFavourite }
      })
    })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Gallery);