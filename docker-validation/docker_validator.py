#!/usr/bin/env python3
"""
Docker Image Validation Tool

Implements the !docker-image-validation command to validate Docker images.
"""

import sys
import json
import requests
import argparse
from typing import List, Dict, Any
from urllib.parse import urlparse
import time


class DockerImageValidator:
    """Main validator class for Docker images."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'docker-image-validator/1.0'
        })
    
    def validate_image_list(self, images: List[str]) -> Dict[str, Any]:
        """
        Validate a list of Docker images.
        
        Args:
            images: List of Docker image names (e.g., ['nginx:latest', 'ubuntu:20.04'])
            
        Returns:
            Dictionary containing validation results for each image
        """
        results = {
            'timestamp': time.time(),
            'total_images': len(images),
            'results': {}
        }
        
        for image in images:
            print(f"Validating image: {image}")
            results['results'][image] = self.validate_single_image(image)
            
        return results
    
    def validate_single_image(self, image: str) -> Dict[str, Any]:
        """
        Validate a single Docker image.
        
        Args:
            image: Docker image name (e.g., 'nginx:latest')
            
        Returns:
            Dictionary containing validation results
        """
        result = {
            'image': image,
            'exists': False,
            'registry': None,
            'tags': [],
            'metadata': {},
            'errors': []
        }
        
        try:
            registry, repository, tag = self.parse_image_name(image)
            result['registry'] = registry
            result['repository'] = repository
            result['tag'] = tag
            
            if self.check_image_exists(registry, repository, tag):
                result['exists'] = True
                result['metadata'] = self.get_image_metadata(registry, repository, tag)
                result['tags'] = self.get_available_tags(registry, repository)
            else:
                result['errors'].append(f"Image {image} not found in registry {registry}")
                
        except Exception as e:
            result['errors'].append(f"Error validating {image}: {str(e)}")
            
        return result
    
    def parse_image_name(self, image: str) -> tuple:
        """
        Parse Docker image name into registry, repository, and tag.
        
        Args:
            image: Docker image name
            
        Returns:
            Tuple of (registry, repository, tag)
        """
        registry = "docker.io"
        tag = "latest"
        
        if ':' in image:
            image, tag = image.rsplit(':', 1)
            
        if '/' in image:
            parts = image.split('/')
            if '.' in parts[0] or ':' in parts[0]:
                registry = parts[0]
                repository = '/'.join(parts[1:])
            else:
                repository = image
        else:
            repository = f"library/{image}"
            
        return registry, repository, tag
    
    def check_image_exists(self, registry: str, repository: str, tag: str) -> bool:
        """
        Check if a Docker image exists in the registry.
        
        Args:
            registry: Registry hostname
            repository: Repository name
            tag: Image tag
            
        Returns:
            True if image exists, False otherwise
        """
        try:
            if registry == "docker.io":
                auth_url = "https://auth.docker.io/token"
                auth_params = {
                    'service': 'registry.docker.io',
                    'scope': f'repository:{repository}:pull'
                }
                
                auth_response = self.session.get(auth_url, params=auth_params, timeout=10)
                if auth_response.status_code == 200:
                    token_data = auth_response.json()
                    token = token_data.get('token')
                    
                    if token:
                        url = f"https://registry-1.docker.io/v2/{repository}/manifests/{tag}"
                        headers = {
                            'Authorization': f'Bearer {token}',
                            'Accept': 'application/vnd.docker.distribution.manifest.v2+json'
                        }
                        response = self.session.head(url, headers=headers, timeout=10)
                        return response.status_code == 200
                
                if repository.startswith('library/'):
                    repo_name = repository.replace('library/', '')
                else:
                    repo_name = repository
                    
                hub_url = f"https://hub.docker.com/v2/repositories/{repo_name}/tags/{tag}/"
                response = self.session.get(hub_url, timeout=10)
                return response.status_code == 200
                
            else:
                url = f"https://{registry}/v2/{repository}/manifests/{tag}"
                response = self.session.head(url, timeout=10)
                return response.status_code == 200
                
        except Exception as e:
            print(f"Error checking image existence for {registry}/{repository}:{tag}: {e}")
            return False
    
    def get_image_metadata(self, registry: str, repository: str, tag: str) -> Dict[str, Any]:
        """
        Get metadata for a Docker image.
        
        Args:
            registry: Registry hostname
            repository: Repository name
            tag: Image tag
            
        Returns:
            Dictionary containing image metadata
        """
        metadata = {}
        
        try:
            if registry == "docker.io":
                if repository.startswith('library/'):
                    repo_name = repository.replace('library/', '')
                else:
                    repo_name = repository
                    
                hub_url = f"https://hub.docker.com/v2/repositories/{repo_name}/"
                response = self.session.get(hub_url, timeout=10)
                
                if response.status_code == 200:
                    repo_data = response.json()
                    metadata['description'] = repo_data.get('description', '')
                    metadata['star_count'] = repo_data.get('star_count', 0)
                    metadata['pull_count'] = repo_data.get('pull_count', 0)
                    metadata['last_updated'] = repo_data.get('last_updated', '')
                    
        except Exception as e:
            print(f"Error getting metadata: {e}")
            
        return metadata
    
    def get_available_tags(self, registry: str, repository: str) -> List[str]:
        """
        Get available tags for a repository.
        
        Args:
            registry: Registry hostname
            repository: Repository name
            
        Returns:
            List of available tags
        """
        tags = []
        
        try:
            if registry == "docker.io":
                if repository.startswith('library/'):
                    repo_name = repository.replace('library/', '')
                else:
                    repo_name = repository
                    
                hub_url = f"https://hub.docker.com/v2/repositories/{repo_name}/tags/"
                response = self.session.get(hub_url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    tags = [result['name'] for result in results[:10]]  # Limit to first 10 tags
                    
        except Exception as e:
            print(f"Error getting tags: {e}")
            
        return tags


def main():
    """Main entry point for the Docker image validator."""
    parser = argparse.ArgumentParser(description='Docker Image Validation Tool')
    parser.add_argument('command', help='Command to execute (should be !docker-image-validation)')
    parser.add_argument('images', nargs='+', help='List of Docker images to validate')
    parser.add_argument('--output', '-o', help='Output file for results (JSON format)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.command != '!docker-image-validation':
        print(f"Error: Unknown command '{args.command}'. Expected '!docker-image-validation'")
        sys.exit(1)
    
    validator = DockerImageValidator()
    results = validator.validate_image_list(args.images)
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Results saved to {args.output}")
    else:
        print("\n" + "="*50)
        print("DOCKER IMAGE VALIDATION RESULTS")
        print("="*50)
        
        for image, result in results['results'].items():
            print(f"\nImage: {image}")
            print(f"  Exists: {'✓' if result['exists'] else '✗'}")
            print(f"  Registry: {result.get('registry', 'N/A')}")
            
            if result['errors']:
                print(f"  Errors: {', '.join(result['errors'])}")
            
            if result['exists']:
                print(f"  Available tags: {', '.join(result['tags'][:5])}")
                if len(result['tags']) > 5:
                    print(f"    ... and {len(result['tags']) - 5} more")
        
        print(f"\nTotal images validated: {results['total_images']}")
        successful = sum(1 for r in results['results'].values() if r['exists'])
        print(f"Successful validations: {successful}")
        print(f"Failed validations: {results['total_images'] - successful}")


if __name__ == '__main__':
    main()
