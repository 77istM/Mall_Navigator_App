import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  bannerStack: {
    position: 'absolute',
    top: 18,
    left: 14,
    right: 14,
    zIndex: 3,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 28,
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  loadingContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 20,
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
