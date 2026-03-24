import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  PrivateModeBanner: {
    position: 'absolute',
    top: 18,
    left: 14,
    right: 14,
    zIndex: 2,
    backgroundColor: '#0f5132',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  PrivateModeBannerText: {
    color: '#d1e7dd',
    fontWeight: '700',
    textAlign: 'center',
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  loadingContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  calloutView: { 
    width: 200, 
    padding: 10 
  },
  calloutTitle: { 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
});
