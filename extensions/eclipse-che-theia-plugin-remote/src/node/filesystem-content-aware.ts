import * as files from '@theia/filesystem/lib/common/files';

import { URI, UriComponents } from 'vscode-uri';

import { BinaryBuffer } from '@theia/core/lib/common/buffer';
/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import { FileSystemExtImpl } from '@theia/plugin-ext/lib/plugin/file-system-ext-impl';
import { overrideUri } from './che-content-aware-utils';

export class FileSystemContentAware {
  static makeFileSystemContentAware(fileSystemExt: FileSystemExtImpl): void {
    const fileSystemContentAware = new FileSystemContentAware();
    fileSystemContentAware.overrideVSCodeResourceScheme(fileSystemExt);
  }

  overrideVSCodeResourceScheme(fileSystemExt: FileSystemExtImpl): void {
    this.override$stat(fileSystemExt);
    this.override$readdir(fileSystemExt);
    this.override$readFile(fileSystemExt);
    this.override$writeFile(fileSystemExt);
    this.override$rename(fileSystemExt);
    this.override$copy(fileSystemExt);
    this.override$mkdir(fileSystemExt);
    this.override$delete(fileSystemExt);
    this.override$open(fileSystemExt);
  }

  protected override$stat(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$stat');
    const original$stat = fileSystemExt.$stat.bind(fileSystemExt);
    fileSystemExt.$stat = (handle: number, resource: UriComponents) => {
      console.log('>>> override$stat call');
      return original$stat(handle, overrideUri(URI.revive(resource)));
    };
  }

  protected override$readdir(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$readdir');
    const original$readdir = fileSystemExt.$readdir.bind(fileSystemExt);
    fileSystemExt.$readdir = (handle: number, resource: UriComponents) =>
      original$readdir(handle, overrideUri(URI.revive(resource)));
  }

  protected override$readFile(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$readFile');
    const original$readFile = fileSystemExt.$readFile.bind(fileSystemExt);
    fileSystemExt.$readFile = (handle: number, resource: UriComponents) =>
      original$readFile(handle, overrideUri(URI.revive(resource)));
  }

  protected override$writeFile(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$writeFile');
    const original$writeFile = fileSystemExt.$writeFile.bind(fileSystemExt);
    fileSystemExt.$writeFile = (
      handle: number,
      resource: UriComponents,
      content: BinaryBuffer,
      opts: files.FileWriteOptions
    ) => original$writeFile(handle, overrideUri(URI.revive(resource)), content, opts);
  }

  protected override$rename(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$rename');
    const original$rename = fileSystemExt.$rename.bind(fileSystemExt);
    fileSystemExt.$rename = (
      handle: number,
      oldUri: UriComponents,
      newUri: UriComponents,
      opts: files.FileOverwriteOptions
    ) => original$rename(handle, overrideUri(URI.revive(oldUri)), overrideUri(URI.revive(newUri)), opts);
  }

  protected override$copy(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$copy');
    const original$copy = fileSystemExt.$copy.bind(fileSystemExt);
    fileSystemExt.$copy = (
      handle: number,
      oldUri: UriComponents,
      newUri: UriComponents,
      opts: files.FileOverwriteOptions
    ) => original$copy(handle, overrideUri(URI.revive(oldUri)), overrideUri(URI.revive(newUri)), opts);
  }

  protected override$mkdir(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$mkdir');
    const original$mkdir = fileSystemExt.$mkdir.bind(fileSystemExt);
    fileSystemExt.$mkdir = (handle: number, resource: UriComponents) =>
      original$mkdir(handle, overrideUri(URI.revive(resource)));
  }

  protected override$delete(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$delete');
    const original$delete = fileSystemExt.$delete.bind(fileSystemExt);
    fileSystemExt.$delete = (handle: number, resource: UriComponents, opts: files.FileDeleteOptions) =>
      original$delete(handle, overrideUri(URI.revive(resource)), opts);
  }

  protected override$open(fileSystemExt: FileSystemExtImpl): void {
    console.log('>>> override$open');
    const original$open = fileSystemExt.$open.bind(fileSystemExt);
    fileSystemExt.$open = (handle: number, resource: UriComponents, opts: files.FileOpenOptions) =>
      original$open(handle, overrideUri(URI.revive(resource)), opts);
  }
}
