/**********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import {
  CheSideCarFileSystem,
  CheSideCarFileSystemMain,
  FileTypeMain,
  PLUGIN_RPC_CONTEXT,
} from '../common/che-protocol';
import { Disposable, Emitter, Event } from '@theia/core/lib/common';
import {
  FileChange,
  FileDeleteOptions,
  FileOverwriteOptions,
  FileSystemProviderCapabilities,
  FileSystemProviderWithFileReadWriteCapability,
  FileType,
  FileWriteOptions,
  Stat,
  WatchOptions,
} from '@theia/filesystem/lib/common/files';

import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { RPCProtocol } from '@theia/plugin-ext/lib/common/rpc-protocol';
import URI from '@theia/core/lib/common/uri';
import { interfaces } from 'inversify';

export class CheSideCarFileSystemMainImpl implements CheSideCarFileSystemMain {
  private readonly registrations = new Map<string, Disposable>();
  private readonly delegate: CheSideCarFileSystem;
  private readonly fileService: FileService;

  constructor(container: interfaces.Container, rpc: RPCProtocol) {
    console.log('+++ che-sidecar-file-system-main.ts:35 constructor called');
    this.delegate = rpc.getProxy(PLUGIN_RPC_CONTEXT.CHE_SIDECAR_FILE_SYSTEM);
    this.fileService = container.get(FileService);
  }

  $disposeFileSystemProvider(scheme: string): Promise<void> {
    const disposable = this.registrations.get(scheme);
    if (disposable !== undefined) {
      disposable.dispose();
      this.registrations.delete(scheme);
    }
    return Promise.resolve(undefined);
  }

  $registerFileSystemProvider(scheme: string): Promise<void> {
    console.log('+++ che-sidecar-file-system-main.ts:50 $registerFileSystemProvider scheme: ' + scheme);
    const provider = new CheSideCarFileSystemProvider(this.delegate, FileSystemProviderCapabilities.FileReadWrite);
    const disposable = this.fileService.registerProvider(scheme, provider);
    this.registrations.set(scheme, disposable);
    return Promise.resolve(undefined);
  }
}

type IDisposable = Disposable;

export class CheSideCarFileSystemProvider implements FileSystemProviderWithFileReadWriteCapability {
  private readonly _onDidChange = new Emitter<readonly FileChange[]>();
  private readonly delegate: CheSideCarFileSystem;

  readonly onDidChangeFile: Event<readonly FileChange[]> = this._onDidChange.event;
  readonly onFileWatchError: Event<void> = new Emitter<void>().event;

  readonly capabilities: FileSystemProviderCapabilities;
  readonly onDidChangeCapabilities: Event<void> = Event.None;

  constructor(delegate: CheSideCarFileSystem, capabilities: FileSystemProviderCapabilities) {
    console.log('+++ che-sidecar-file-system-main.ts:71 CheSideCarFileSystemProvider > constructor');
    this.capabilities = capabilities;
    this.delegate = delegate;
  }

  watch(resource: URI, opts: WatchOptions): IDisposable {
    throw new Error('Not implemented yet.');
  }

  async stat(resource: URI): Promise<Stat> {
    const stat = await this.delegate.$stat(resource.path.toString());
    return {
      type: this.toType(stat.type),
      ctime: stat.ctime,
      mtime: stat.mtime,
      size: stat.size,
    };
  }

  mkdir(resource: URI): Promise<void> {
    return this.delegate.$mkdir(resource.toString());
  }

  async readdir(resource: URI): Promise<[string, FileType][]> {
    return (await this.delegate.$readdir(resource.toString())).map(value => [value[0], this.toType(value[1])]);
  }

  delete(resource: URI, opts: FileDeleteOptions): Promise<void> {
    return this.delegate.$delete(resource.toString(), { recursive: opts.recursive, useTrash: opts.useTrash });
  }

  rename(from: URI, to: URI, opts: FileOverwriteOptions): Promise<void> {
    return this.delegate.$rename(from.toString(), to.toString(), { overwrite: opts.overwrite });
  }

  async readFile(resource: URI): Promise<Uint8Array> {
    console.log(
      '+++ che-sidecar-file-system-main.ts:102 CheSideCarFileSystemProvider > readFile for resource: ' +
        resource.path.toString()
    );
    return Buffer.from(await this.delegate.$readFile(resource.path.toString()));
  }

  async writeFile(resource: URI, content: Uint8Array, opts: FileWriteOptions): Promise<void> {
    return this.delegate.$writeFile(resource.path.toString(), content.toString(), {
      overwrite: opts.overwrite,
      create: opts.create,
    });
  }

  private toType(type: FileTypeMain): FileType {
    switch (type) {
      case FileTypeMain.Directory:
        return FileType.Directory;
      case FileTypeMain.File:
        return FileType.File;
      case FileTypeMain.SymbolicLink:
        return FileType.SymbolicLink;
      case FileTypeMain.Unknown:
        return FileType.Unknown;
    }
  }
}
